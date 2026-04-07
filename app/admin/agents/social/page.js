import { getAllPosts } from "@/lib/allPosts";
import { requireAdmin } from "@/lib/adminGuard";
import SocialAgentClient from "./SocialAgentClient";

export const metadata = { title: "Social Agent - Admin", robots: { index: false, follow: false } };

export default function AdminSocialAgentPage() {
  requireAdmin("/admin/agents/social");

  const queue = getAllPosts()
    .filter((post) => post.auto)
    .slice(0, 5)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || "",
      channels: ["LinkedIn", "X", "Facebook"],
      fullPost: post,
    }));

  const subagents = [
    {
      name: "LinkedIn Subagent",
      href: "/admin/agents/social/linkedin",
      description: "Company page content optimizer",
      env: "LINKEDIN_ACCESS_TOKEN",
      connected: Boolean(process.env.LINKEDIN_ACCESS_TOKEN),
      icon: "💼",
    },
    {
      name: "X (Twitter) Subagent",
      href: "/admin/agents/social/x",
      description: "Corporate account tweet generator",
      env: "X_CONSUMER_KEY, X_CONSUMER_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET",
      connected: Boolean(
        (process.env.X_CONSUMER_KEY || process.env.X_API_KEY) &&
          (process.env.X_CONSUMER_SECRET || process.env.X_API_SECRET) &&
          process.env.X_ACCESS_TOKEN &&
          (process.env.X_ACCESS_SECRET || process.env.X_ACCESS_TOKEN_SECRET)
      ),
      icon: "𝕏",
    },
    {
      name: "Facebook Subagent",
      href: "/admin/agents/social/facebook",
      description: "Business page community manager",
      env: "FACEBOOK_PAGE_ACCESS_TOKEN, FACEBOOK_PAGE_ID",
      connected: Boolean(process.env.FACEBOOK_PAGE_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID),
      icon: "f",
    },
  ];

  const accountChecks = [
    {
      name: "LinkedIn Company Page",
      env: "LINKEDIN_ACCESS_TOKEN",
      connected: Boolean(process.env.LINKEDIN_ACCESS_TOKEN),
      scope: "w_member_social, r_organization_social",
    },
    {
      name: "X (Twitter) Account",
      env: "X_CONSUMER_KEY / X_CONSUMER_SECRET / X_ACCESS_TOKEN / X_ACCESS_SECRET",
      connected: Boolean(
        (process.env.X_CONSUMER_KEY || process.env.X_API_KEY) &&
          (process.env.X_CONSUMER_SECRET || process.env.X_API_SECRET) &&
          process.env.X_ACCESS_TOKEN &&
          (process.env.X_ACCESS_SECRET || process.env.X_ACCESS_TOKEN_SECRET)
      ),
      scope: "Tweet create/read",
    },
    {
      name: "Facebook Page",
      env: "FACEBOOK_PAGE_ACCESS_TOKEN + FACEBOOK_PAGE_ID",
      connected: Boolean(process.env.FACEBOOK_PAGE_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID),
      scope: "pages_manage_posts, pages_read_engagement",
    },
  ];

  const schedulerReady = Boolean(process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET);

  return (
    <SocialAgentClient
      queue={queue}
      subagents={subagents}
      accountChecks={accountChecks}
      schedulerReady={schedulerReady}
    />
  );
}