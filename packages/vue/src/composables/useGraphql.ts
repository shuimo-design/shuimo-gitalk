import { shuimoPost } from '@/shuimoRequest'
import { setState, state } from '@/store'
import type { Ref } from 'vue'

const getQL = (vars: Record<string, any>, pagerDirection: 'last' | 'first') => {
  const cursorDirection = pagerDirection === 'last' ? 'before' : 'after'
  const ql = `
  query getIssueAndComments(
    $owner: String!,
    $repo: String!,
    $id: Int!,
    $cursor: String,
    $pageSize: Int!
  ) {
    repository(owner: $owner, name: $repo) {
      issue(number: $id) {
        title
        url
        bodyHTML
        createdAt
        comments(${pagerDirection}: $pageSize, ${cursorDirection}: $cursor) {
          totalCount
          pageInfo {
            ${pagerDirection === 'last' ? 'hasPreviousPage' : 'hasNextPage'}
            ${cursorDirection === 'before' ? 'startCursor' : 'endCursor'}
          }
          nodes {
            id
            databaseId
            author {
              avatarUrl
              login
              url
            }
            bodyHTML
            body
            createdAt
            reactions(first: 100, content: HEART) {
              totalCount
              viewerHasReacted
              pageInfo{
                hasNextPage
              }
              nodes {
                id
                databaseId
                user {
                  login
                }
              }
            }
          }
        }
      }
    }
  }
  `

  if (vars.cursor == null) delete vars.cursor

  return {
    operationName: 'getIssueAndComments',
    query: ql,
    variables: vars,
  }
}

export default function useGraphql(token: Ref<string>) {
  const getCommentsByGraphql = async (issue: GitHubIssue) => {
    const { owner, repo, perPage, pagerDirection, defaultAuthor } =
      state.options
    const { cursor, comments } = state
    const res = await shuimoPost<GitHubData, any>(
      '/graphql',
      getQL(
        {
          owner,
          repo,
          id: issue.number,
          pageSize: perPage,
          cursor,
        },
        pagerDirection
      ),
      {
        headers: {
          Authorization: `bearer ${token.value}`,
        },
      }
    )

    const data = res.data.repository.issue.comments
    const items = data.nodes.map((node) => {
      const author = node.author || defaultAuthor

      return {
        id: node.databaseId,
        gId: node.id,
        user: {
          avatar_url: author.avatarUrl,
          login: author.login,
          html_url: author.url,
        },
        created_at: node.createdAt,
        body_html: node.bodyHTML,
        body: node.body,
        html_url: `https://github.com/${owner}/${repo}/issues/${issue.number}#issuecomment-${node.databaseId}`,
        reactions: node.reactions,
      }
    })

    let cs

    if (pagerDirection === 'last') {
      cs = [...items, ...comments]
    } else {
      cs = [...comments, ...items]
    }

    const isLoadOver =
      data.pageInfo.hasPreviousPage === false ||
      data.pageInfo.hasNextPage === false
    state.comments = cs
    state.isLoadOver = isLoadOver
    state.cursor = data.pageInfo.startCursor || data.pageInfo.endCursor

    return cs
  }

  const unLike = async (comment: any) => {
    const { user } = state
    let { comments } = state

    const getQL = (id: string) => ({
      operationName: 'RemoveReaction',
      query: `
          mutation RemoveReaction{
            removeReaction (input:{
              subjectId: "${id}",
              content: HEART
            }) {
              reaction {
                content
              }
            }
          }
        `,
    })

    const res = await shuimoPost('/graphql', getQL(comment.gId), {
      headers: {
        Authorization: `bearer ${token.value}`,
      },
    })
    if (res) {
      comments = comments.map((c) => {
        if (c.id === comment.id) {
          const index = c.reactions.nodes.findIndex(
            (n: any) => n.user.login === user?.login
          )
          if (~index) {
            c.reactions.totalCount -= 1
            c.reactions.nodes.splice(index, 1)
          }
          c.reactions.viewerHasReacted = false
          return Object.assign({}, c)
        }
        return c
      })
      state.comments = comments
    }
  }

  const like = async (comment: any) => {
    const { owner, repo } = state.options
    const { user } = state
    let { comments } = state

    const res = await shuimoPost(
      `/repos/${owner}/${repo}/issues/comments/${comment.id}/reactions`,
      {
        content: 'heart',
      },
      {
        headers: {
          Authorization: `token ${token.value}`,
          Accept: 'application/vnd.github.squirrel-girl-preview',
        },
      }
    )
    comments = comments.map((c) => {
      if (c.id === comment.id) {
        if (c.reactions) {
          if (
            !~c.reactions.nodes.findIndex(
              (n: any) => n.user.login === user?.login
            )
          ) {
            c.reactions.totalCount += 1
          }
        } else {
          c.reactions = { nodes: [] }
          c.reactions.totalCount = 1
        }

        c.reactions.nodes.push(res)
        c.reactions.viewerHasReacted = true
        return Object.assign({}, c)
      }
      return c
    })
    state.comments = comments
  }

  return {
    getCommentsByGraphql,
    like,
    unLike,
  }
}
