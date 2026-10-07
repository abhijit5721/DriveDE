// Types for the test that imports the page generator from src/.
export interface ShellArgs {
  lang: 'de' | 'en';
  title: string;
  description: string;
  canonical: string;
  head?: string;
  body: string;
  slug?: string | null;
}
export function loadScenarios(ROOT: string): Promise<unknown[]>;
export function buildExamPages(opts: {
  shell: (args: ShellArgs) => string;
  esc: (s: string) => string;
  SITE: string;
  ROOT: string;
  outRoot?: string;
  today?: string;
  scenarios?: unknown[] | null;
}): Promise<string[]>;
