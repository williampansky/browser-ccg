import dynamic from 'next/dynamic';
import { Layout } from '../../components/site-components';
import { siteConfig } from '../../app.config';

// The profile lives in localStorage, so the editor renders on the client only.
const ProfilePage = dynamic(() => import('../../components/player-profile/ProfilePage').then((m) => m.ProfilePage), {
  ssr: false,
});

export default function TheProfilePage() {
  const page = siteConfig.pages.profile;
  return (
    <Layout title={page.name} description={page.description}>
      <ProfilePage />
    </Layout>
  );
}
