export interface GithubRepo {
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
  };
}
