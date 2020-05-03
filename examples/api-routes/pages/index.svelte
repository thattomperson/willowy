<script context="module">
  export function preload() {
    return this.fetch('/api/quote')
      .then(res => res.json())
      .then(quote => { quote })
  }
</script>

<script>
  // export let quote

  let quote = {
    quote:
      "“Here's to the crazy ones. The misfits. The rebels. The troublemakers. The round pegs in the square holes. The ones who see things differently. They're not fond of rules. And they have no respect for the status quo. You can quote them, disagree with them, glorify or vilify them. About the only thing you can't do is ignore them. Because they change things. They push the human race forward. And while some may see them as the crazy ones, we see genius. Because the people who are crazy enough to think they can change the world, are the ones who do.”",
    author: 'Rob Siltanen',
    link:
      'https://www.goodreads.com/quotes/924-here-s-to-the-crazy-ones-the-misfits-the-rebels-the',
  }
</script>


<blockquote cite={quote.link}>
  <p>{ quote.quote }</p>
  <footer>— { quote.author }</footer>
</blockquote>

<style>
blockquote {
  max-width: 500px;
  margin: auto;
  border-left: skyblue 5px solid;
  padding: .5em 1em;
  border-radius: 5px;
}
</style>