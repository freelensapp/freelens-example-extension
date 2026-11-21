// @vitest-environment jsdom

import { Common, type Renderer } from "@freelensapp/extensions";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Example } from "../api/example/example-v1alpha2";
import { ExamplesPage } from "../pages/examples-page-v1alpha2";
import {
  ErrorBoundary,
  withDetailsErrorBoundary,
  withMenuItemErrorBoundary,
  withPageErrorBoundary,
  withPreferenceErrorBoundary,
  withWorkloadsOverviewErrorBoundary,
} from "./error-boundary";

// A minimal stub extension - only `name` is read by the boundary.
const extension = { name: "example-extension" } as Renderer.LensExtension;

beforeEach(() => {
  // React reports an error that a boundary caught on the console as well.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

const Throws = ({ message = "boom" }: { message?: string }): React.JSX.Element => {
  throw new Error(message);
};

// A child that throws only for some objects, as a details panel does for an object without a field it reads.
const ThrowsFor = ({ object }: { object: { broken: boolean } }) => {
  if (object.broken) throw new Error("broken object");
  return <p>fine object</p>;
};

describe("ErrorBoundary", () => {
  it("renders the error page in place of a child that throws, logs it, and leaves its siblings rendered", () => {
    render(
      <>
        <p>before</p>
        <ErrorBoundary extension={extension}>
          <p>inside</p>
          <Throws />
        </ErrorBoundary>
        <p>after</p>
      </>,
    );

    expect(screen.getByText("Error: boom")).toBeDefined();
    expect(screen.queryByText("inside")).toBeNull();
    expect(screen.getByText("before")).toBeDefined();
    expect(screen.getByText("after")).toBeDefined();
    expect(Common.logger.error).toHaveBeenCalledTimes(1);
    expect(Common.logger.error).toHaveBeenCalledWith("[example-extension]: Error: boom", expect.any(String));
  });

  it("renders nothing in place of a child that throws with the fallback nothing, and logs it", () => {
    render(
      <ul>
        <li>Edit</li>
        <ErrorBoundary extension={extension} fallback="nothing">
          <li>Suspend</li>
          <Throws message="menu item" />
        </ErrorBoundary>
        <li>Delete</li>
      </ul>,
    );

    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Edit", "Delete"]);
    expect(Common.logger.error).toHaveBeenCalledWith("[example-extension]: Error: menu item", expect.any(String));
  });

  it("renders its children without an error", () => {
    render(
      <ErrorBoundary extension={extension}>
        <p>inside</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("inside")).toBeDefined();
    expect(Common.logger.error).not.toHaveBeenCalled();
  });

  it("renders the children again for a new reset key", () => {
    const broken = { broken: true };
    const fixed = { broken: false };
    const { rerender } = render(
      <ErrorBoundary extension={extension} resetKey={broken}>
        <ThrowsFor object={broken} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Error: broken object")).toBeDefined();

    rerender(
      <ErrorBoundary extension={extension} resetKey={fixed}>
        <ThrowsFor object={fixed} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("fine object")).toBeDefined();
    expect(screen.queryByText("Error: broken object")).toBeNull();
  });
});

describe("the registration wrappers", () => {
  it("keep an error of a page inside the page", () => {
    const { Page } = withPageErrorBoundary(extension, {
      id: "broken",
      components: { Page: () => <Throws /> },
    }).components;

    render(
      <>
        <Page params={{}} />
        <p>sidebar</p>
      </>,
    );

    expect(screen.getByText("Error: boom")).toBeDefined();
    expect(screen.getByText("sidebar")).toBeDefined();
  });

  // A `try`/`catch` around the call of the page, as `withErrorPage` was, does not see this error: the host calls
  // `renderTableContents` from the render of its own list layout, a child of the page.
  it("keep an error that a callback of the page throws from the render of the host's list layout inside the page", () => {
    const object = new Example({
      apiVersion: "example.freelens.app/v1alpha2",
      kind: "Example",
      metadata: { name: "example", namespace: "default", uid: "1", resourceVersion: "1", selfLink: "" },
      spec: {},
    });
    vi.spyOn(Example, "getStore").mockReturnValue({ items: [object] } as unknown as Renderer.K8sApi.KubeObjectStore<
      Example,
      Renderer.K8sApi.KubeApi<Example>
    >);
    vi.spyOn(Example, "getSuspended").mockImplementation(() => {
      throw new Error("no suspended field");
    });
    const { Page } = withPageErrorBoundary(extension, {
      id: "example",
      components: { Page: () => <ExamplesPage /> },
    }).components;

    render(<Page params={{}} />);

    expect(screen.getByText("Error: no suspended field")).toBeDefined();
    expect(Common.logger.error).toHaveBeenCalledTimes(1);
    expect(Common.logger.error).toHaveBeenCalledWith(
      "[example-extension]: Error: no suspended field",
      expect.any(String),
    );
  });

  it("keep an error of a details panel inside the panel, and render it again for a new object", () => {
    const { Details } = withDetailsErrorBoundary(extension, {
      kind: "Example",
      apiVersions: ["example.freelens.app/v1alpha2"],
      components: { Details: ThrowsFor },
    }).components;

    const { rerender } = render(
      <>
        <Details object={{ broken: true }} />
        <p>other panel</p>
      </>,
    );

    expect(screen.getByText("Error: broken object")).toBeDefined();
    expect(screen.getByText("other panel")).toBeDefined();

    rerender(
      <>
        <Details object={{ broken: false }} />
        <p>other panel</p>
      </>,
    );

    expect(screen.getByText("fine object")).toBeDefined();
  });

  it("render nothing for a menu item that throws, and leave the other items rendered", () => {
    const { MenuItem } = withMenuItemErrorBoundary(extension, {
      kind: "Example",
      apiVersions: ["example.freelens.app/v1alpha2"],
      components: { MenuItem: () => <Throws message="menu item" /> },
    }).components;

    render(
      <ul>
        <li>Edit</li>
        <MenuItem object={{}} />
        <li>Delete</li>
      </ul>,
    );

    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Edit", "Delete"]);
    expect(screen.queryByText(/menu item/)).toBeNull();
    expect(Common.logger.error).toHaveBeenCalledWith("[example-extension]: Error: menu item", expect.any(String));
  });

  it("render nothing for a preference input or hint that throws, and leave the other one and the page rendered", () => {
    const { Input, Hint } = withPreferenceErrorBoundary(extension, {
      title: "Broken",
      components: { Input: () => <Throws message="preference input" />, Hint: () => <span>hint</span> },
    }).components;

    render(
      <section>
        <h2>Broken</h2>
        <Input />
        <Hint />
        <p>other preference</p>
      </section>,
    );

    expect(screen.queryByText(/preference input/)).toBeNull();
    expect(screen.getByText("hint")).toBeDefined();
    expect(screen.getByText("Broken")).toBeDefined();
    expect(screen.getByText("other preference")).toBeDefined();
    expect(Common.logger.error).toHaveBeenCalledWith(
      "[example-extension]: Error: preference input",
      expect.any(String),
    );
  });

  it("render nothing for a preference hint that throws, and leave the input rendered", () => {
    const { Input, Hint } = withPreferenceErrorBoundary(extension, {
      title: "Broken",
      components: { Input: () => <span>input</span>, Hint: () => <Throws message="preference hint" /> },
    }).components;

    render(
      <section>
        <Input />
        <Hint />
      </section>,
    );

    expect(screen.getByText("input")).toBeDefined();
    expect(screen.queryByText(/preference hint/)).toBeNull();
    expect(Common.logger.error).toHaveBeenCalledWith("[example-extension]: Error: preference hint", expect.any(String));
  });

  it("keep an error of a Workloads Overview item inside the item, and leave the host's panels rendered", () => {
    const { Details } = withWorkloadsOverviewErrorBoundary(extension, {
      components: { Details: () => <Throws message="overview item" /> },
    }).components;

    render(
      <>
        <p>host panel</p>
        <Details />
      </>,
    );

    expect(screen.getByText("Error: overview item")).toBeDefined();
    expect(screen.getByText("host panel")).toBeDefined();
    expect(Common.logger.error).toHaveBeenCalledWith("[example-extension]: Error: overview item", expect.any(String));
  });
});
