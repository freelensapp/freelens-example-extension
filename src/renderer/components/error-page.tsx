import { Common, type Renderer } from "@freelensapp/extensions";
import React from "react";

export interface ErrorPageProps {
  error?: unknown;
  extension: Renderer.LensExtension;
  children?: React.ReactNode;
}

export const ErrorPage = ({ error, extension, children }: ErrorPageProps) => {
  if (error) {
    Common.logger.error(`[${extension.name}]: ${error}`);
  }
  return (
    <div className="flex justify-center w-full h-full">
      {error ? <p className="flex align-center error">{String(error)}</p> : <></>}
      {children}
    </div>
  );
};

/**
 * Wraps component in try/catch block and prints ErrorPage on error.
 *
 * ```ts
 * export const Component = (props: ComponentProps) => withErrorPage(props, () => {
 *   throw new Error("something died");
 * })
 * ```
 */
export function withErrorPage<P extends { extension: Renderer.LensExtension }>(
  props,
  wrapped: (props: P) => JSX.Element,
) {
  try {
    return wrapped(props);
  } catch (error) {
    return <ErrorPage error={error} extension={props.extension} />;
  }
}
