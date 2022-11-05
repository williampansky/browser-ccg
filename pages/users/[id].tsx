import { GetStaticProps, GetStaticPaths } from 'next';
import { Layout } from '../../components/site-components';

import { tempUsers } from '../../tempUsers';
import { Account } from '../../types';

type Props = {
  item?: Account;
  errors?: string;
};

const StaticPropsDetail = ({ item, errors }: Props) => {
  if (errors) {
    return (
      <Layout title='Error | Next.js + TypeScript Example'>
        <p>
          <span style={{ color: 'red' }}>Error:</span> {errors}
        </p>
      </Layout>
    );
  }

  return (
    <Layout
      title={`${
        item ? item.displayName : 'User Detail'
      } | Next.js + TypeScript Example`}
    >
      {item ? (
        <div>
          <h1>Detail for {item.displayName}</h1>
          <p>ID: {item.uuid}</p>
        </div>
      ) : null}
    </Layout>
  );
};

export default StaticPropsDetail;

export const getStaticPaths: GetStaticPaths = async () => {
  // Get the paths we want to pre-render based on users
  const paths = tempUsers.map((user) => ({
    params: { id: user.uuid.toString() },
  }));

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: false };
};

// This function gets called at build time on server-side.
// It won't be called on client-side, so you can even do
// direct database queries.
export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const id = params?.id;
    const item = tempUsers.find((data) => data.uuid === id);
    // By returning { props: item }, the StaticPropsDetail component
    // will receive `item` as a prop at build time
    return { props: { item } };
  } catch (err: any) {
    return { props: { errors: err?.message } };
  }
};
