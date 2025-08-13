export interface GithubRepo {
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
  };
}

export interface GitHubNotification {
  id: string;
  unread: boolean;
  reason: string;
  updated_at: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  subject: {
    title: string;
    url: string;
    type: string;
  };

  [key: string]: unknown;
}
