import Link from 'next/link';
import { Layout } from '../../components/site-components';

export default function ApiList() {
  return (
    <Layout title='Api List | Next.js + TypeScript Example'>
      <h1>Apis List</h1>
      <p>
        Example fetching data from inside <code>getStaticProps()</code>.
      </p>
      <p>You are currently on: /api-list</p>
      <ul>
        <li>
          <a href='/api/users'>Users API</a>
        </li>
        <li>
          <a href='/api/cards'>Cards API</a>
        </li>
        <li>
          <a href='/api/zones'>Zones API</a>
        </li>
      </ul>
      <p>
        <Link href='/'>
          <a>Go home</a>
        </Link>
      </p>
    </Layout>
  );
}