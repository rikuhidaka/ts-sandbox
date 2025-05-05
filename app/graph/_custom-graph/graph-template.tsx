import { PropsWithChildren } from 'react';

export const GraphTemplate = ({ title, children }: PropsWithChildren<{ title: string }>) => {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
};
