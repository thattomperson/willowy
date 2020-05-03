const quotes = [
  {
    quote:
      "“I'm selfish, impatient and a little insecure. I make mistakes, I am out of control and at times hard to handle. But if you can't handle me at my worst, then you sure as hell don't deserve me at my best.”",
    author: 'Marilyn Monroe',
    link:
      'https://www.goodreads.com/quotes/8630-i-m-selfish-impatient-and-a-little-insecure-i-make-mistakes',
  },
  {
    quote: '“Be yourself; everyone else is already taken.”',
    author: 'Oscar Wilde',
    link:
      'https://www.goodreads.com/quotes/19884-be-yourself-everyone-else-is-already-taken',
  },
  {
    quote:
      "“Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.”",
    author: 'Albert Einstein',
    link:
      'https://www.goodreads.com/quotes/942-two-things-are-infinite-the-universe-and-human-stupidity-and',
  },
  {
    quote: '“So many books, so little time.”',
    author: 'Frank Zappa',
    link: 'https://www.goodreads.com/quotes/66-so-many-books-so-little-time',
  },
  {
    quote:
      "“Be who you are and say what you feel, because those who mind don't matter, and those who matter don't mind.”",
    author: 'Bernard M. Baruch',
    link:
      'https://www.goodreads.com/quotes/865-be-who-you-are-and-say-what-you-feel-because',
  },
  {
    quote: '“A room without books is like a body without a soul.”',
    author: 'Marcus Tullius Cicero',
    link:
      'https://www.goodreads.com/quotes/764-a-room-without-books-is-like-a-body-without-a',
  },
  {
    quote: "“You've gotta dance like there's nobody watching,",
    author: 'William W. Purkey',
    link:
      'https://www.goodreads.com/quotes/10123-you-ve-gotta-dance-like-there-s-nobody-watching-love-like-you-ll',
  },
  {
    quote:
      "“You know you're in love when you can't fall asleep because reality is finally better than your dreams.”",
    author: 'Dr. Seuss',
    link:
      'https://www.goodreads.com/quotes/7901-you-know-you-re-in-love-when-you-can-t-fall-asleep',
  },
  {
    quote: '“You only live once, but if you do it right, once is enough.”',
    author: 'Mae West',
    link:
      'https://www.goodreads.com/quotes/1598-you-only-live-once-but-if-you-do-it-right',
  },
  {
    quote: '“Be the change that you wish to see in the world.”',
    author: 'Mahatma Gandhi',
    link:
      'https://www.goodreads.com/quotes/24499-be-the-change-that-you-wish-to-see-in-the',
  },
  {
    quote:
      "“In three words I can sum up everything I've learned about life: it goes on.”",
    author: 'Robert Frost',
    link:
      'https://www.goodreads.com/quotes/258-in-three-words-i-can-sum-up-everything-i-ve-learned',
  },
  {
    quote:
      "“If you want to know what a man's like, take a good look at how he treats his inferiors, not his equals.”",
    author: 'J.K. Rowling,',
    link:
      'https://www.goodreads.com/quotes/5399-if-you-want-to-know-what-a-man-s-like-take',
  },
  {
    quote: '“Don’t walk in front of me… I may not follow',
    author: 'Albert Camus',
    link:
      'https://www.goodreads.com/quotes/54-don-t-walk-in-front-of-me-i-may-not-follow',
  },
  {
    quote: '“No one can make you feel inferior without your consent.”',
    author: 'Eleanor Roosevelt,',
    link:
      'https://www.goodreads.com/quotes/11035-no-one-can-make-you-feel-inferior-without-your-consent',
  },
  {
    quote:
      '“Friendship ... is born at the moment when one man says to another "What! You too? I thought that no one but myself . . .”',
    author: 'C.S. Lewis,',
    link:
      'https://www.goodreads.com/quotes/10554-friendship-is-born-at-the-moment-when-one-man',
  },
  {
    quote: "“If you tell the truth, you don't have to remember anything.”",
    author: 'Mark Twain',
    link:
      'https://www.goodreads.com/quotes/9131-if-you-tell-the-truth-you-don-t-have-to-remember',
  },
  {
    quote:
      "“I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.”",
    author: 'Maya Angelou',
    link:
      'https://www.goodreads.com/quotes/5934-i-ve-learned-that-people-will-forget-what-you-said-people',
  },
  {
    quote: '“A friend is someone who knows all about you and still loves you.”',
    author: 'Elbert Hubbard',
    link:
      'https://www.goodreads.com/quotes/16949-a-friend-is-someone-who-knows-all-about-you-and',
  },
  {
    quote: '“Always forgive your enemies; nothing annoys them so much.”',
    author: 'Oscar Wilde',
    link:
      'https://www.goodreads.com/quotes/4583-always-forgive-your-enemies-nothing-annoys-them-so-much',
  },
  {
    quote:
      '“To live is the rarest thing in the world. Most people exist, that is all.”',
    author: 'Oscar Wilde',
    link:
      'https://www.goodreads.com/quotes/2448-to-live-is-the-rarest-thing-in-the-world-most',
  },
  {
    quote:
      '“Live as if you were to die tomorrow. Learn as if you were to live forever.”',
    author: 'Mahatma Gandhi',
    link:
      'https://www.goodreads.com/quotes/2253-live-as-if-you-were-to-die-tomorrow-learn-as',
  },
  {
    quote:
      '“Darkness cannot drive out darkness: only light can do that. Hate cannot drive out hate: only love can do that.”',
    author: 'Martin Luther King Jr.,',
    link:
      'https://www.goodreads.com/quotes/943-darkness-cannot-drive-out-darkness-only-light-can-do-that',
  },
  {
    quote:
      "“I am so clever that sometimes I don't understand a single word of what I am saying.”",
    author: 'Oscar Wilde,',
    link:
      'https://www.goodreads.com/quotes/1198-i-am-so-clever-that-sometimes-i-don-t-understand-a',
  },
  {
    quote: '“Without music, life would be a mistake.”',
    author: 'Friedrich Nietzsche,',
    link:
      'https://www.goodreads.com/quotes/4590-without-music-life-would-be-a-mistake',
  },
  {
    quote: '“We accept the love we think we deserve.”',
    author: 'Stephen Chbosky,',
    link:
      'https://www.goodreads.com/quotes/2534-we-accept-the-love-we-think-we-deserve',
  },
  {
    quote:
      '“To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.”',
    author: 'Ralph Waldo Emerson',
    link:
      'https://www.goodreads.com/quotes/876-to-be-yourself-in-a-world-that-is-constantly-trying',
  },
  {
    quote:
      "“Here's to the crazy ones. The misfits. The rebels. The troublemakers. The round pegs in the square holes. The ones who see things differently. They're not fond of rules. And they have no respect for the status quo. You can quote them, disagree with them, glorify or vilify them. About the only thing you can't do is ignore them. Because they change things. They push the human race forward. And while some may see them as the crazy ones, we see genius. Because the people who are crazy enough to think they can change the world, are the ones who do.”",
    author: 'Rob Siltanen',
    link:
      'https://www.goodreads.com/quotes/924-here-s-to-the-crazy-ones-the-misfits-the-rebels-the',
  },
  {
    quote:
      '“Insanity is doing the same thing, over and over again, but expecting different results.”',
    author: 'Narcotics Anonymous',
    link:
      'https://www.goodreads.com/quotes/5543-insanity-is-doing-the-same-thing-over-and-over-again',
  },
  {
    quote:
      "“I believe that everything happens for a reason. People change so that you can learn to let go, things go wrong so that you appreciate them when they're right, you believe lies so you eventually learn to trust no one but yourself, and sometimes good things fall apart so better things can fall together.”",
    author: 'Marilyn Monroe',
    link:
      'https://www.goodreads.com/quotes/12379-i-believe-that-everything-happens-for-a-reason-people-change',
  },
  {
    quote:
      "“Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do. So throw off the bowlines. Sail away from the safe harbor. Catch the trade winds in your sails. Explore. Dream. Discover.”",
    author: 'H. Jackson Brown Jr.,',
    link:
      'https://www.goodreads.com/quotes/2340-twenty-years-from-now-you-will-be-more-disappointed-by',
  },
]

export function get(req, res) {
  res.json(quotes[Math.floor(Math.random() * quotes.length)])
}
