import { Common, type Renderer } from "@freelensapp/extensions";
import React from "react";
import styles from "./error-page.module.scss";

export interface ErrorPageProps {
  error?: unknown;
  children?: React.ReactNode;
}

/**
 * The error, in place of a page or a details panel that threw it. `ErrorBoundary` renders it and logs the error.
 */
export function ErrorPage({ error, children }: ErrorPageProps) {
  return (
    <div className={styles.errorPage}>
      {error ? <p className={styles.errorMessage}>{String(error)}</p> : <></>}
      {children}
    </div>
  );
}

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
  props: P,
  wrapped: (props: P) => React.JSX.Element,
) {
  try {
    return wrapped(props);
  } catch (error) {
    Common.logger.error(`[${props.extension.name}]: ${error}`);
    return <ErrorPage error={error} />;
  }
}
