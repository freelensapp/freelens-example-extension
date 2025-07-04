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
      {error && <p className="flex align-center error">{error ? String(error) : children}</p>}
      {children}
    </div>
  );
};
