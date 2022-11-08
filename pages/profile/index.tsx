import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Container, Layout } from '../../components/site-components';
import { tempUsers } from '../../tempUsers';
import { Account } from '../../types';
import { siteConfig } from '../../config.app';
const { pages: { profile } } = siteConfig;

// type Props = {
//   items: Account[];
// };

export default function ProfilePage() {
  const [users, setUsers] = useState<Account[]>([]);

  const fetchUsers = async () => {
    const response = await fetch('/api/users');
    const data = await response.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Layout title={profile.name} description={profile.description}>
      <Container>
        <h1>{profile.name}</h1>
        <p>
          Example fetching data from inside <code>getStaticProps()</code>.
        </p>
        <p>You are currently on: /users</p>
        <ul>
          {users?.map((user) => (
            <li key={user.uuid}>
              <Link href={`/users/${user.uuid}`}>
                <a>{user.displayName}</a>
              </Link>
            </li>
          ))}
        </ul>
        <p>
          <Link href='/'>
            <a>Go home</a>
          </Link>
        </p>
      </Container>
    </Layout>
  );
}

// export const getStaticProps: GetStaticProps = async () => {
//   // Example for including static props in a Next.js function component page.
//   // Don't forget to include the respective types for any props passed into
//   // the component.
//   const items: Account[] = tempUsers;
//   return { props: { items } };
// };

// export default WithStaticProps;
