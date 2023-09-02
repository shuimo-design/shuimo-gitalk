import { defineComponent } from 'vue'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { de, es, fr, ko, pl, ru, zhCN, zhTW } from 'date-fns/locale'
import { state } from '@/store'
import Svg from './Svg'
import Avatar from './Avatar'

if (typeof window !== `undefined`) {
  window.GT_i18n_LocaleMap = {
    zh: zhCN,
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    'es-ES': es,
    fr,
    ru,
    pl,
    ko,
    de,
  }
}

export default defineComponent({
  name: 'Commen',
  props: {
    comment: {
      type: Object,
      default: () => ({}),
    },
    commentedText: {
      type: String,
      default: '',
    },
  },
  emits: ['reply', 'like', 'unlike'],
  setup(props, { emit }) {
    const enableEdit =
      state.user && props.comment.user.login === state.user.login
    const isAdmin = ~state.options.admin
      .map((a) => a.toLowerCase())
      .indexOf(props.comment.user.login.toLowerCase())
    const reactions = props.comment.reactions
    let reactionTotalCount = ''
    if (reactions && reactions.totalCount) {
      reactionTotalCount = reactions.totalCount
      if (
        reactions.totalCount === 100 &&
        reactions.pageInfo &&
        reactions.pageInfo.hasNextPage
      ) {
        reactionTotalCount = '100+'
      }
    }

    const likeCallback = () => {
      if (props.comment.reactions && props.comment.reactions.viewerHasReacted) {
        emit('unlike', props.comment)
      }
      emit('like', props.comment)
    }

    const replyCallback = () => {
      emit('reply', props.comment)
    }

    return () => (
      <div class={`gt-comment ${isAdmin ? 'gt-comment-admin' : ''}`}>
        <Avatar
          className="gt-comment-avatar"
          src={props.comment.user && props.comment.user.avatar_url}
          alt={props.comment.user && props.comment.user.login}
        />

        <div class="gt-comment-content">
          <div class="gt-comment-header">
            <div class={`gt-comment-block-${state.user ? '2' : '1'}`} />
            <a
              class="gt-comment-username"
              href={props.comment.user && props.comment.user.html_url}
            >
              {props.comment.user && props.comment.user.login}
            </a>
            <span class="gt-comment-text">{props.commentedText}</span>
            <span class="gt-comment-date">
              {formatDistanceToNow(parseISO(props.comment.created_at), {
                addSuffix: true,
                locale:
                  window.GT_i18n_LocaleMap[state.options.language as string],
              })}
            </span>

            {reactions && (
              <a class="gt-comment-like" title="Like" onClick={likeCallback}>
                {reactions.viewerHasReacted ? (
                  <Svg
                    className="gt-ico-heart"
                    name="heart_on"
                    text={reactionTotalCount}
                  />
                ) : (
                  <Svg
                    className="gt-ico-heart"
                    name="heart"
                    text={reactionTotalCount}
                  />
                )}
              </a>
            )}

            {enableEdit ? (
              <a
                href={props.comment.html_url}
                class="gt-comment-edit"
                title="Edit"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Svg className="gt-ico-edit" name="edit" />
              </a>
            ) : (
              <a class="gt-comment-reply" title="Reply" onClick={replyCallback}>
                <Svg className="gt-ico-reply" name="reply" />
              </a>
            )}
          </div>
          <div
            class="gt-comment-body markdown-body"
            innerHTML={props.comment.body_html}
          />
        </div>
      </div>
    )
  },
})
