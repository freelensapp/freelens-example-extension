import { Common, type Renderer } from "@freelensapp/extensions";
import React from "react";
import { ErrorPage } from "./error-page";

export interface ErrorBoundaryProps {
  extension: Renderer.LensExtension;
  /**
   * What renders in place of the children after an error: the error page, or nothing, for a menu item, where an
   * error page would not fit.
   */
  fallback?: "error-page" | "nothing";
  /**
   * A new value clears the error and renders the children again: the object of a details panel or a menu item, which
   * the host replaces with a new one when the object changes.
   */
  resetKey?: unknown;
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
  error?: unknown;
  resetKey?: unknown;
}

/**
 * Keeps an error that its children throw while React renders them inside the boundary: it logs the error with the
 * name of the extension and the component stack, and renders the error page, or nothing, in place of the children.
 *
 * A `try`/`catch` around the call of a component does not see such an error: a child component renders later than
 * the call, and the host calls a callback such as `renderTableContents` of `KubeObjectListLayout` from its own
 * render. The host has no boundary around the details drawer or a menu item of an extension, and its boundary
 * around the cluster frame would replace the whole cluster view.
 *
 * It is a class component of the host's React, because only a class component can be an error boundary, with no
 * decorators and no `observer`: it reads no observable, and the children it renders are observers of their own.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> {
    return { failed: true, error };
  }

  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: ErrorBoundaryState): ErrorBoundaryState | null {
    return Object.is(props.resetKey, state.resetKey) ? null : { failed: false, resetKey: props.resetKey };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    Common.logger.error(`[${this.props.extension.name}]: ${error}`, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    if (this.props.fallback === "nothing") return null;
    return <ErrorPage error={this.state.error} />;
  }
}
