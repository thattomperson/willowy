<aside>
  <div>
    <h4>Stuff</h4>
    <div class="link"><a href="/docs/getting-started">Getting Started</a></div>
    <div class="link"><a href="/docs/installing">Installing</a></div>
  </div>
</aside>

<slot></slot>

<style>
.link {
  content: "";
  flex-basis: 4px;
  flex-shrink: 0;
  display: block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgb(102, 102, 102) none repeat scroll 0% 0%;
  margin-right: 16px;
}
</style>