import { reactive } from 'vue'

const state = reactive<GitalkState>({
  user: undefined,
  issue: undefined,
  comments: [],
  localComments: [],
  comment: '',
  page: 1,
  pagerDirection: 'last',
  cursor: undefined,
  previewHtml: '',
  isNoInit: false,
  isIniting: true,
  isCreating: false,
  isLoading: false,
  isLoadMore: false,
  isLoadOver: false,
  isIssueCreating: false,
  isPopupVisible: false,
  isInputFocused: false,
  isPreview: false,
  isOccurError: false,
  errorMsg: '',
  options: {
    clientID: '',
    clientSecret: '',
    repo: '',
    owner: '',
    admin: [''],
    id: window.location.href,
    number: -1,
    labels: ['Gitalk'],
    title: window.document.title,
    body: '',
    language: window.navigator.language || window.navigator.language,
    perPage: 10,
    pagerDirection: 'last',
    createIssueManually: false,
    distractionFreeMode: false,
    proxy:
      'https://cors-anywhere.azm.workers.dev/https://github.com/login/oauth/access_token',
    flipMoveOptions: {
      staggerDelayBy: 150,
      appearAnimation: 'accordionVertical',
      enterAnimation: 'accordionVertical',
      leaveAnimation: 'accordionVertical',
    },
    enableHotKey: true,

    url: window.location.href,

    defaultAuthor: {
      avatarUrl: '//avatars1.githubusercontent.com/u/29697133?s=50',
      login: 'null',
      url: '',
    },

    updateCountCallback: null,
  },
})

function setState<T, K extends keyof T>(obj: T, key: K, val: T[K]): void {
  const newState = obj
  newState[key] = val
}

export { state, setState }
