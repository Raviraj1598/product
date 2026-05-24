import { Fragment } from 'react';
import { Link } from 'react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';

export type StoreBreadcrumbItem = {
  label: string;
  href?: string;
};

export function StoreBreadcrumb({ items }: { items: StoreBreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {items.map((item, i) => (
          <Fragment key={`${item.label}-${i}`}>
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link to={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="max-w-[min(100%,14rem)] truncate">{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
