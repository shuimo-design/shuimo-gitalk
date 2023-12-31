interface GitalkOptions {
  /**
   * GitHub Application Client ID.
   */
  clientID: string

  /**
   * GitHub Application Client Secret.
   */
  clientSecret: string

  /**
   * Name of Github repository.
   */
  repo: string

  /**
   * GitHub repository owner.
   * Can be personal user or organization.
   */
  owner: string

  /**
   * GitHub repository owner and collaborators.
   * (Users who having write access to this repository)
   */
  admin: string[]

  /**
   * The unique id of the page.
   * Length must less than 50.
   *
   * @default location.href
   */
  id?: string

  /**
   * The issue ID of the page.
   * If the number attribute is not defined, issue will be located using id.
   *
   * @default -1
   */
  number?: number

  /**
   * GitHub issue labels.
   *
   * @default ['Gitalk']
   */
  labels?: string[]

  /**
   * GitHub issue title.
   *
   * @default document.title
   */
  title?: string

  /**
   * GitHub issue body.
   *
   * @default location.href + header.meta[description]
   */
  body?: string

  /**
   * Localization language key.
   * en, zh-CN and zh-TW are currently available.
   *
   * @default navigator.language || navigator.userLanguage
   */
  language?: string

  /**
   * Pagination size, with maximum 100.
   *
   * @default 10
   */
  perPage: number

  /**
   * Facebook-like distraction free mode.
   *
   * @default false
   */
  distractionFreeMode?: boolean

  /**
   * Comment sorting direction.
   * Available values are last and first.
   *
   * @default "last"
   */
  pagerDirection: 'last' | 'first'

  /**
   * By default, Gitalk will create a corresponding github issue for your every single page automatically when the logined user is belong to the admin users.
   * You can create it manually by setting this option to true.
   *
   * @default false
   */
  createIssueManually?: boolean

  /**
   * GitHub oauth request reverse proxy for CORS.
   * [Why need this?](https://github.com/isaacs/github/issues/330)
   *
   * @default "https://cors-anywhere.azm.workers.dev/https://github.com/login/oauth/access_token"
   */
  proxy?: string

  /**
   * Enable hot key (cmd|ctrl + enter) submit comment.
   *
   * @default true
   */
  enableHotKey?: boolean

  [key: string]: any
}

interface GitalkState {
  user?: UserInfo
  issue?: any
  comments: any[]
  localComments: any[]
  comment: string
  page: number
  pagerDirection: 'last' | 'first'
  cursor?: any
  previewHtml: string

  isNoInit: boolean
  isIniting: boolean
  isCreating: boolean
  isLoading: boolean
  isLoadMore: boolean

  isLoadOver: boolean
  isIssueCreating: boolean
  isPopupVisible: boolean
  isInputFocused: boolean
  isPreview: boolean

  isOccurError: boolean
  errorMsg: string

  options: GitalkOptions
}

interface UserInfo {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: 'User'
  site_admin: boolean
  name: string
  company?: string
  blog: string
  location: string
  email?: string
  hireable?: string
  bio?: string
  twitter_username?: string
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

interface GitHubIssue {
  url?: string
  repository_url?: string
  labels_url?: string
  comments_url: string
  events_url?: string
  html_url?: string
  id?: number
  node_id?: string
  number?: number
  title?: string
  user?: {
    login?: string
    id?: number
    node_id?: string
    avatar_url?: string
    gravatar_id?: string
    url?: string
    html_url?: string
    followers_url?: string
    following_url?: string
    gists_url?: string
    starred_url?: string
    subscriptions_url?: string
    organizations_url?: string
    repos_url?: string
    events_url?: string
    received_events_url?: string
    type?: string
    site_admin?: boolean
  }
  labels?: {
    id?: number
    node_id?: string
    url?: string
    name?: string
    color?: string
    default?: boolean
    description?: string | null
  }[]
  state?: string
  locked?: boolean
  assignee?: null
  assignees?: []
  milestone?: null
  comments?: number
  created_at?: string
  updated_at?: string
  closed_at?: string | null
  author_association?: string
  active_lock_reason?: null
  body?: string
  closed_by?: null
  reactions?: {
    url?: string
    total_count?: number
    '+1'?: number
    '-1'?: number
    laugh?: number
    hooray?: number
    confused?: number
    heart?: number
    rocket?: number
    eyes?: number
  }
  timeline_url?: string
  performed_via_github_app?: null
  state_reason?: null
}

interface GitHubComment {
  id: string
  databaseId: number
  author: {
    avatarUrl: string
    login: string
    url: string
  }
  bodyHTML: string
  body: string
  createdAt: string
  reactions: {
    totalCount: number
    viewerHasReacted: boolean
    pageInfo: {
      hasNextPage: boolean
    }
    nodes: any[] // 如果需要定义更详细的类型，请根据实际数据结构添加更多信息
  }
}

interface GitHubIssueI {
  title: string
  url: string
  bodyHTML: string
  createdAt: string
  comments: {
    totalCount: number
    pageInfo: {
      hasPreviousPage: boolean
      startCursor: string
      hasNextPage: boolean
      endCursor: string
    }
    nodes: GitHubComment[]
  }
}

interface GitHubData {
  data: {
    repository: {
      issue: GitHubIssueI
    }
  }
}

interface Window {
  GT_i18n_LocaleMap: Record<string, any>
}
