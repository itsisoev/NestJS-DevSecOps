export interface GitHubProfile {
  githubId: string;
  username: string;
  emails?: { value: string }[];
  photos?: { value: string }[];
}
