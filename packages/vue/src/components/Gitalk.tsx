import { TransitionGroup, defineComponent, nextTick, onMounted, ref } from 'vue'
import { MBorder, MButton, MLoading, MPopover } from 'shuimo-ui'
import autosize from 'autosize'
import { GT_COMMENT, GT_VERSION } from '@/constant'
import { queryParse, queryStringify } from '@/utils'
import { formatErrorMsg, shuimoJSON } from '@/shuimoRequest'
import { state } from '@/store'
import useGithub from '@/composables/useGithub'
import useI18n from '@/composables/useI18n'
import useGraphql from '@/composables/useGraphql'
import Action from './Action'
import Svg from './Svg'
import Avatar from './Avatar'
import Commen from './Commen'
import type { PropType } from 'vue'
import 'shuimo-ui/dist/style.css'

export default defineComponent({
  name: 'Gitalk',
  props: {
    options: {
      type: Object as PropType<GitalkOptions>,
      required: true,
    },
  },
  setup(props) {
    state.options = {
      ...state.options,
      ...props.options,
    }

    const accessToken = ref('')
    const createBtnRef = ref<HTMLElement>()
    const commentRef = ref<HTMLElement>()

    state.pagerDirection = state.options.pagerDirection || 'last'
    const storedComment = localStorage.getItem(GT_COMMENT)
    if (storedComment) {
      state.comment = storedComment
      window.localStorage.removeItem(GT_COMMENT)
    }

    const {
      isAdmin,
      loginLink,
      getUserInfo,
      getIssue,
      getComments,
      createIssue,
      logout,
      createComment,
      previewComment,
    } = useGithub(accessToken)
    const { like, unLike } = useGraphql(accessToken)
    const i18n = useI18n(state.options.language as string)

    const init = async () => {
      try {
        await getUserInfo()
        const issue = await getIssue()
        if (issue) {
          await getComments(issue)
        }
      } catch (err) {
        console.log(err)
      }
    }

    onMounted(async () => {
      const query = queryParse<{ code?: string }>()
      if (query.code) {
        const code = query.code
        delete query.code
        const replacedUrl = `${window.location.origin}${
          window.location.pathname
        }?${queryStringify(query)}${window.location.hash}`
        history.replaceState(null, '', replacedUrl)
        state.options = {
          ...state.options,
          url: replacedUrl,
          id: replacedUrl,
          ...props.options,
        }

        const accessRes = await shuimoJSON
          .post<{
            access_token: string
          }>(state.options.proxy as string, {
            code,
            client_id: state.options.clientID,
            client_secret: state.options.clientSecret,
          })
          .catch((err) => {
            state.isOccurError = false
            state.errorMsg = formatErrorMsg(err)
          })

        if (accessRes && accessRes.data) {
          const { access_token } = accessRes.data
          if (access_token) {
            accessToken.value = access_token
            await init().catch((err) => {
              state.isIniting = false
              state.isOccurError = false
              state.errorMsg = formatErrorMsg(err)
            })
            state.isIniting = false
          }
        } else {
          state.isOccurError = false
          state.errorMsg = formatErrorMsg(new Error('no access token'))
        }
      } else {
        await init().catch((err) => {
          state.isIniting = false
          state.isOccurError = false
          state.errorMsg = formatErrorMsg(err)
        })
        state.isIniting = false
      }
    })

    const loading = () => (
      <div class="gt-initing">
        <MLoading />
        <p class="gt-initing-text">{i18n.t('init')}</p>
      </div>
    )

    const handleIssueCreate = async () => {
      state.isIssueCreating = true
      const issue = await createIssue().catch((err) => {
        state.isIssueCreating = false
        state.isOccurError = true
        state.errorMsg = formatErrorMsg(err)
      })
      if (issue) {
        state.isIssueCreating = false
        state.isOccurError = false
        const commentsRes = await getComments(issue)
        console.log('commentsRes', commentsRes)
        if (commentsRes) {
          state.isNoInit = false
        }
      }
    }

    const handleLogin = () => {
      const { comment } = state
      window.localStorage.setItem(GT_COMMENT, encodeURIComponent(comment))
      window.location.href = loginLink.value
    }

    const noInit = () => {
      const { user } = state
      const { owner, repo, admin } = state.options
      return (
        <div class="gt-no-init" key="no-init">
          <p
            innerHTML={i18n.t('no-found-related', {
              link: `<a href="https://github.com/${owner}/${repo}/issues">Issues</a>`,
            })}
          />
          <p
            innerHTML={i18n.t('please-contact', {
              user: admin.map((u) => `@${u}`).join(' '),
            })}
          />
          {isAdmin ? (
            <p>
              <MButton
                onClick={handleIssueCreate}
                text={i18n.t('init-issue')}
              />
            </p>
          ) : null}
          {!user && (
            <MButton
              class="gt-btn-login"
              onClick={handleLogin}
              text={i18n.t('login-with-github')}
            />
          )}
        </div>
      )
    }

    const meta = () => {
      const { user, issue, isPopupVisible, pagerDirection, localComments } =
        state
      const cnt = (issue && issue.comments) + localComments.length
      const isDesc = pagerDirection === 'last'
      const { updateCountCallback } = state.options

      if (
        updateCountCallback &&
        Object.prototype.toString.call(updateCountCallback) ===
          '[object Function]'
      ) {
        try {
          updateCountCallback(cnt)
        } catch (err) {
          console.log(
            'An error occurred executing the updateCountCallback:',
            err
          )
        }
      }

      const handlePopup = () => {
        state.isPopupVisible = !state.isPopupVisible
      }

      const handleSort = (direction: 'last' | 'first') => {
        state.pagerDirection = direction
      }

      const handleLogout = () => {
        logout()
        window.location.reload()
      }

      return (
        <div class="gt-meta" key="meta">
          <span
            class="gt-counts"
            innerHTML={i18n.t('counts', {
              counts: `<a class="gt-link gt-link-counts" href="${
                issue && issue.html_url
              }" target="_blank" rel="noopener noreferrer">${cnt}</a>`,
              smart_count: cnt,
            })}
          ></span>
          <MPopover class="gt-user" show={state.isPopupVisible}>
            {{
              default: () => (
                <div class="gt-user">
                  {user ? (
                    <div
                      class={
                        state.isPopupVisible
                          ? 'gt-user-inner is--poping'
                          : 'gt-user-inner'
                      }
                      onClick={handlePopup}
                    >
                      <span class="gt-user-name">{user.login}</span>
                      <Svg class="gt-ico-arrdown" name="arrow_down" />
                    </div>
                  ) : (
                    <div
                      class={
                        isPopupVisible
                          ? 'gt-user-inner is--poping'
                          : 'gt-user-inner'
                      }
                      onClick={handlePopup}
                    >
                      <span class="gt-user-name">{i18n.t('anonymous')}</span>
                      <Svg class="gt-ico-arrdown" name="arrow_down" />
                    </div>
                  )}
                </div>
              ),
              content: () => (
                <MBorder>
                  <div class="gt-popup">
                    {user ? (
                      <Action
                        class={`gt-action-sortasc${
                          !isDesc ? ' is--active' : ''
                        }`}
                        onClick={() => handleSort('first')}
                        text={i18n.t('sort-asc')}
                      />
                    ) : null}
                    {user ? (
                      <Action
                        class={`gt-action-sortdesc${
                          isDesc ? ' is--active' : ''
                        }`}
                        onClick={() => handleSort('last')}
                        text={i18n.t('sort-desc')}
                      />
                    ) : null}
                    {user ? (
                      <Action
                        class="gt-action-logout"
                        onClick={handleLogout}
                        text={i18n.t('logout')}
                      />
                    ) : (
                      <a
                        class="gt-action gt-action-login"
                        onClick={handleLogin}
                      >
                        {i18n.t('login-with-github')}
                      </a>
                    )}
                    <div class="gt-copyright">
                      <a
                        class="gt-link gt-link-project"
                        href="https://github.com/shuimo-design/shuimo-gitalk"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Shuimo-Gitalk
                      </a>
                      <span class="gt-version">{GT_VERSION}</span>
                    </div>
                  </div>
                </MBorder>
              ),
            }}
          </MPopover>
        </div>
      )
    }

    const handleCommentCreate = async (e?: Event) => {
      if (state.comment.length === 0) {
        e && e.preventDefault()
        commentRef.value && commentRef.value.focus()
        return
      }
      state.isCreating = true
      await createComment().catch((err) => {
        state.isCreating = false
        state.isOccurError = true
        state.errorMsg = formatErrorMsg(err)
      })
      state.isCreating = false
      state.isOccurError = false
    }

    const handleCommentChange = (e: Event) => {
      state.comment = (e.target as HTMLTextAreaElement).value
    }

    const handleCommentFocus = (e: Event) => {
      const { distractionFreeMode } = state.options
      if (!distractionFreeMode) return e.preventDefault()
      state.isInputFocused = true
    }

    const handleCommentBlur = (e: Event) => {
      const { distractionFreeMode } = state.options
      if (!distractionFreeMode) return e.preventDefault()
      state.isInputFocused = false
    }

    const handleCommentKeyDown = (e: KeyboardEvent) => {
      const { enableHotKey } = state.options
      if (enableHotKey && (e.metaKey || e.ctrlKey) && e.keyCode === 13) {
        createBtnRef.value && createBtnRef.value.focus()
        handleCommentCreate()
      }
    }

    const handleCommentPreview = async () => {
      state.isPreview = !state.isPreview
      if (!state.isPreview) {
        return
      }
      await previewComment()
    }

    const header = () => {
      return (
        <div class="gt-header" key="header">
          {state.user ? (
            <Avatar
              class="gt-header-avatar"
              src={state.user.avatar_url}
              alt={state.user.login}
            />
          ) : (
            <a class="gt-avatar-github" onClick={handleLogin}>
              <Svg class="gt-ico-github" name="github" />
            </a>
          )}
          <div class="gt-header-comment">
            <MBorder>
              <textarea
                class={`gt-header-textarea ${state.isPreview ? 'hide' : ''}`}
                value={state.comment}
                onChange={handleCommentChange}
                onFocus={handleCommentFocus}
                onBlur={handleCommentBlur}
                onKeydown={handleCommentKeyDown}
                placeholder={i18n.t('leave-a-comment')}
              />
              <div
                class={`gt-header-preview markdown-body ${
                  state.isPreview ? '' : 'hide'
                }`}
                innerHTML={state.previewHtml}
              />
            </MBorder>
            <div class="gt-header-controls">
              <a
                class="gt-header-controls-tip"
                href="https://guides.github.com/features/mastering-markdown/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Svg
                  class="gt-ico-tip"
                  name="tip"
                  text={i18n.t('support-markdown')}
                />
              </a>
              {state.user && (
                <MButton
                  class="gt-btn-public"
                  ref={createBtnRef}
                  onClick={handleCommentCreate}
                  text={i18n.t('comment')}
                />
              )}

              <MButton
                class="gt-btn-preview"
                onClick={handleCommentPreview}
                text={state.isPreview ? i18n.t('edit') : i18n.t('preview')}
              />
              {!state.user && (
                <MButton
                  type="confirm"
                  class="gt-btn-login"
                  onClick={handleLogin}
                  text={i18n.t('login-with-github')}
                />
              )}
            </div>
          </div>
        </div>
      )
    }

    const reply = (c: any) => {
      const { comment } = state
      const replyCommentBody = c.body
      let replyCommentArray = replyCommentBody.split('\n')
      replyCommentArray.unshift(`@${c.user.login}`)
      replyCommentArray = replyCommentArray.map((t: any) => `> ${t}`)
      replyCommentArray.push('', '')
      if (comment) replyCommentArray.unshift('')
      state.comment += replyCommentArray.join('\n')
      nextTick(() => {
        autosize.update(commentRef.value as Element)
        commentRef.value && commentRef.value.focus()
      })
    }

    const comments = () => {
      const totalComments = state.comments.concat([])
      if (state.pagerDirection === 'last' && accessToken.value) {
        totalComments.reverse()
      }
      return (
        <div class="gt-comments" key="comments">
          <TransitionGroup name="list">
            {totalComments.map((c) => (
              <Commen
                comment={c}
                key={c.id}
                commentedText={i18n.t('commented')}
                onReply={reply}
                onUnlike={unLike}
                onLike={like}
              />
            ))}
          </TransitionGroup>
        </div>
      )
    }

    return () => (
      <div
        class={`gt-container${state.isInputFocused ? ' gt-input-focused' : ''}`}
      >
        {state.isIniting && loading()}
        {!state.isIniting && (state.isNoInit ? [] : [meta()])}
        {state.isOccurError && <div class="gt-error">{state.errorMsg}</div>}
        {!state.isIniting &&
          (state.isNoInit ? [noInit()] : [header(), comments()])}
      </div>
    )
  },
})
