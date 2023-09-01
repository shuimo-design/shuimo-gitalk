import { computed } from 'vue'
import { GT_ACCESS_TOKEN } from '@/constant'
import { shuimoGet, shuimoPost } from '@/shuimoRequest'
import { setState, state } from '@/store'
import { getMetaContent } from '@/utils'
import useGraphql from './useGraphql'
import type { Ref } from 'vue'

/**
 * @Description
 * @Author youus
 * @Date 2023/9/1 22:45
 * @Version v1.0.0
 *
 * Hello, humor
 */
export default function useInit(token: Ref<string>) {
  const logout = () => {
    setState<GitalkState, 'user'>(state, 'user', undefined)
    window.localStorage.removeItem(GT_ACCESS_TOKEN)
  }

  const isAdmin = computed(() => {
    const { admin } = state.options
    const { user } = state
    return (
      user &&
      admin.map((a) => a.toLowerCase()).indexOf(user.login.toLowerCase())
    )
  })

  const getUserInfo = async () => {
    if (!token.value) {
      return
    }
    const userInfo = await shuimoGet<UserInfo>(
      '/user',
      {},
      {
        headers: {
          Authorization: `token ${token.value}`,
        },
      }
    ).catch(() => {
      logout()
    })
    if (userInfo) {
      setState<GitalkState, 'user'>(state, 'user', userInfo)
    }
  }

  const getIssueById = async () => {
    const { owner, repo, number, clientID, clientSecret } = state.options
    const getUrl = `/repos/${owner}/${repo}/issues/${number}`

    const issueInfo = await shuimoGet<GitHubIssue>(
      getUrl,
      {
        t: Date.now(),
      },
      {
        auth: {
          username: clientID,
          password: clientSecret,
        },
      }
    ).catch((err) => {
      if (err.response.status === 404) {
        return null
      }
    })

    if (issueInfo && issueInfo.number === number) {
      setState<GitalkState, 'issue'>(state, 'issue', issueInfo)
      return issueInfo
    }
  }

  const createIssue = async () => {
    const { owner, repo, title, body, id, labels, url } = state.options
    const issueInfo = await shuimoPost<GitHubIssue, any>(
      `/repos/${owner}/${repo}/issues`,
      {
        title,
        labels: labels?.concat(id as string),
        body:
          body ||
          `${url} \n\n ${
            getMetaContent('description') ||
            getMetaContent('description', 'og:description') ||
            ''
          }`,
      },
      {
        headers: {
          Authorization: `token ${token.value}`,
        },
      }
    )
    setState<GitalkState, 'issue'>(state, 'issue', issueInfo)
    return issueInfo
  }

  const getIssueByLabels = async (): Promise<GitHubIssue> => {
    const { owner, repo, id, labels, clientID, clientSecret } = state.options
    const getUrl = `/repos/${owner}/${repo}/issues`
    const issueInfos = await shuimoGet<GitHubIssue[]>(
      getUrl,
      {
        labels: labels?.concat(id as string).join(',') as string,
        t: Date.now(),
      },
      {
        auth: {
          username: clientID,
          password: clientSecret,
        },
      }
    )
    console.log('issueInfos', issueInfos)
    const { createIssueManually } = state.options
    let isNoInit = false
    let issue = undefined
    if (!(issueInfos && issueInfos.length > 0)) {
      if (!createIssueManually && isAdmin.value) {
        const issueInfo = await createIssue()
        return issueInfo
      }
      isNoInit = true
    } else {
      issue = issueInfos[0]
    }

    state.isNoInit = isNoInit
    state.issue = issue

    return issue as GitHubIssue
  }

  const getIssue = async (): Promise<GitHubIssue> => {
    const { number } = state.options
    const { issue } = state
    if (issue) {
      setState(state, 'isIniting', false)
      return issue
    }

    const issueInfoByLabels = await getIssueByLabels()
    console.log('issueInfoByLabels', issueInfoByLabels)

    console.log('number', number)

    if (number && number > 0) {
      const issueInfoById = await getIssueById()
      if (!issueInfoById) {
        return issueInfoByLabels
      }
      return issueInfoById
    }

    return issueInfoByLabels
  }

  const { getCommentsByGraphql } = useGraphql(token)

  const getCommentsV3 = async () => {
    const { clientID, clientSecret, perPage } = state.options
    const { page } = state

    const issueInfo = await getIssue()
    if (!issueInfo) {
      return
    }

    const res = await shuimoGet<GitHubComment[]>(
      issueInfo.comments_url,
      {
        per_page: perPage,
        page,
      },
      {
        headers: {
          Accept: 'application/vnd.github.v3.full+json',
        },
        auth: {
          username: clientID,
          password: clientSecret,
        },
      }
    )

    const { comments, issue } = state
    let isLoadOver = false
    const cs = comments.concat(res)
    if (cs.length >= issue.comments || res.length < perPage) {
      isLoadOver = true
    }
    state.comments = cs
    state.isLoadOver = isLoadOver
    state.page = page + 1

    return cs
  }

  const getComments = async (issue: GitHubIssue) => {
    if (!issue) {
      return
    }
    if (token.value) {
      const comments = await getCommentsByGraphql(issue)
      return comments
    }
    const commentsV3 = await getCommentsV3()
    return commentsV3
  }

  return {
    getUserInfo,
    getIssue,
    getComments,
  }
}
