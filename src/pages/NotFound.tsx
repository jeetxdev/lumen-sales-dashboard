import { Link } from 'react-router-dom';
import { PageHeader } from '../layout/PageHeader';
import { paths } from '../routes';

export function NotFound({ what = 'Page' }: { what?: string }) {
  return (
    <>
      <PageHeader title={`${what} not found`} subtitle="It may have been removed, or the link is wrong." />
      <Link to={paths.overview} className="btn btn-primary align-start">
        Go to Overview
      </Link>
    </>
  );
}
