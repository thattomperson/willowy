import routes from 'router-manifest'
import Router from '@willowy/router'

export default new Router({
  target: document.getElementById('app'),
  props: { routes }
})
