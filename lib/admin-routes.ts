/** Labels and copy for admin chrome + page headers (pathname from `usePathname()`). */
export function adminPageMeta(pathname: string): {
  title: string;
  description?: string;
} {
  if (pathname === "/admin") {
    return {
      title: "Overview",
      description:
        "Metrics and shortcuts — your control center for the blog.",
    };
  }
  if (pathname.startsWith("/admin/posts/new")) {
    return {
      title: "New post",
      description: "Create a draft, schedule, or publish when you’re ready.",
    };
  }
  if (/^\/admin\/posts\/[^/]+\/edit$/.test(pathname)) {
    return {
      title: "Edit post",
      description: "Update content, SEO, cover, and publishing options.",
    };
  }
  if (pathname.startsWith("/admin/posts")) {
    return {
      title: "Posts",
      description: "Manage drafts, scheduled posts, and published articles.",
    };
  }
  if (pathname.startsWith("/admin/comments")) {
    return {
      title: "Comments",
      description: "Approve, hide, or remove reader comments.",
    };
  }
  if (pathname.startsWith("/admin/subscribers")) {
    return {
      title: "Subscribers",
      description: "Newsletter list and CSV export.",
    };
  }
  if (pathname.startsWith("/admin/categories")) {
    return {
      title: "Categories",
      description: "Organize posts with names, slugs, and icons.",
    };
  }
  if (pathname.startsWith("/admin/users")) {
    return {
      title: "Users",
      description: "Roles and admin access for Convex-authenticated accounts.",
    };
  }
  return { title: "Admin" };
}
