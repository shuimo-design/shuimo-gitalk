import { Teleport, h } from 'vue';
import GitalkComponent from './components/Gitalk';

class Gitalk {
  private _options: GitalkOptions;

  constructor(options: GitalkOptions) {
    this._options = options;
  }

  render(constainer: HTMLElement | string) {
    return h(Teleport, { to: constainer }, [
      h(GitalkComponent, { options: this._options })
    ])
  }
}

export default Gitalk;
