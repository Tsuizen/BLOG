export const posts = [{"excerpt":"","title":"在Next.js博客中添加RSS支持","content":"\n现在使用 RSS 订阅的人越来越少了，但是对我而言，在信息过剩的时代通过 RSS 过滤不相干的推荐信息是保持高效获取信息的必要手段。\n本文我会介绍如何在博客中添加 RSS 订阅功能\n\n## RSS 是什么\n\n> RSS(Really Simple Syndication)是一种描述和同步网站内容的格式，其中包含来自网站的更新摘要，通常采用带有链接的文章列表的形式。\n\n## 为博客添加 RSS 功能\n\n为个人博客添加 RSS 支持需要用到一个同名包\n\n```shell\npnpm add rss -D\n```\n\n接着，创建一个 RSS 对象，里面包含了你博客的标题，描述，url 等信息\n\n```typescript\nconst feed = new RSS({\n  title: \"Tsuizen's blog\",\n  description: '随便写东西的地方',\n  site_url: siteUrl,\n  feed_url: `${siteUrl}/feed.xml`,\n  language: 'cn',\n  pubDate: new Date(),\n  copyright: `All rights reserved ${new Date().getFullYear()}, Tsuizen`\n});\n```\n\n全部属性可参考[RSS channel 属性](https://www.runoob.com/rss/rss-channel.html)\n\n然后遍历所有的文章并添加文章信息\n\n```typescript\nallPosts.map((post) => {\n  feed.item({\n    title: post.title,\n    url: `${siteUrl}/posts/${post.title}`,\n    date: post.date,\n    description: post.description\n  });\n});\n```\n\n可以添加的信息请参考[RSS item 元素](https://www.runoob.com/rss/rss-item.html)\n\n最后将其写入 public 目录即可，完整代码如下\n\n```typescript\nimport { writeFileSync } from 'fs';\nimport RSS from 'rss';\n\nimport { Post } from '@/types';\n\nimport { getRecentPosts } from './posts';\n\ntype RSSPost = Pick<Post, 'title' | 'createdAt' | 'description'> & {\n  date: Date;\n  url: string;\n};\n\nconst getRSS = async () => {\n  const siteUrl = process.env.SITE_URL;\n  const allPosts = await getRecentPosts<RSSPost>([\n    'title',\n    'createdAt',\n    'description'\n  ]);\n\n  const feed = new RSS({\n    title: \"Tsuizen's blog\",\n    description: '随便写东西的地方',\n    site_url: siteUrl,\n    feed_url: `${siteUrl}/feed.xml`,\n    language: 'cn',\n    pubDate: new Date(),\n    copyright: `All rights reserved ${new Date().getFullYear()}, Tsuizen`\n  });\n\n  allPosts.map((post) => {\n    feed.item({\n      title: post.title,\n      url: `${siteUrl}/posts/${post.title}`,\n      date: post.date,\n      description: post.description\n    });\n  });\n\n  writeFileSync('./public/feed.xml', feed.xml({ indent: true }));\n};\n\nexport default getRSS;\n```\n\n要让博客能够及时更新 xml 文件，还需要在 `page/index.tsx` 中的 `getStaticProps` 添加执行语句，\n\n```typescript\nexport async function getStaticProps() {\n  ...\n\n  await getRSS();\n\n  ...\n}\n```\n\n现在访问首页后就可以看见 public 目录中生成了 `feed.xml`，用户访问`/feed.xml`就可以订阅 RSS 了\n","slug":"add-rss-in-nextjs","tags":["RSS","Next.js"],"draft":false},{"excerpt":"","title":"为博客添加SEO优化以及站点地图","content":"\n## 为博客添加 SEO 和站点地图\n\nSEO 的学问非常多，本博客尽可能贴近谷歌指导的规范对 seo 进行配置。\n\n在 next.js 项目中添加 seo 一般使用`next-seo`第三方库。要在全部页面配置默认 SEO 需要在`_app.tsx`文件中引入`DefaultSeo`组件。\n\n```tsx\nexport default function App() {\n\n// ...\n\n  const SEO = {\n    defaultTitle: \"Tsuizen's blog\",\n    titleTemplate: \"%s | Tsuizen's blog\",\n    description: 'Tsuizen的个人博客',\n    canonical: \"https://blog.tsuizen.cn\",\n    robotsProps: {\n      noarchive: false, // 不显示缓存链接\n      nosnippet: false, // 不在搜索中显示文本片段\n      maxSnippet: -1, // 值为-1谷歌会显示他认为最有效的文本片段长度\n      notranslate: false, // 不在搜索结果中提供页面翻译\n      noimageindex: false // 不要在此页面上为图像编制索引。如果不指定此值，页面上的图像可能会被编入索引并显示在搜索结果中。\n    }\n  };\n\n  return {\n    <DefaultSeo {...SEO} />\n  }\n}\n```\n\n以上是我选择的默认设置，`titleTemplate`中的 %s 是每个页面单独设置的标题内容，这样所有的页面就默认会携带 %s\n后面的模板。其他的配置可以参考`next-seo`的[文档](https://github.com/garmeeh/next-seo)\n\n接着来单独配置每个页面的内容，需要在相应页面引入`NextSEO`组件，以 post 页为例在`NextSEO`组件中添加对应的内容即可，\n想要在社交网站分享时呈现不错的效果就需要对 openGraph 进行配置\n\n```tsx\n<NextSeo\n  {...SEO}\n  title={post.title}\n  description={post.description}\n  canonical={'https://blog.tsuizen.cn/' + post.title}\n  openGraph={{\n    title: `${post.title}`,\n    description: `${post.description}`,\n    url: 'https://blog.tsuizen.cn/posts/' + post.title,\n    type: 'article',\n    article: {\n      publishedTime: post.createdAt,\n      modifiedTime: post.updatedAt,\n      authors: ['Tsuizen'],\n      tags: post.tags\n    },\n    images: []\n  }}\n/>\n```\n\n## 结构化数据 JSON-LD\n\n我们还可以在网页中添加结构化数据让谷歌读取，针对不同的网页类型作不同的搜索结果呈现。\n在博客页面，我添加了一个 Article 的结构化数据用来描述文章信息\n\n<Youtube videoId=\"vioCbTo3C-4\" />\n\n```tsx\n<ArticleJsonLd\n  url={`https://blog.tsuizen.cn/posts/${post.title}`}\n  title={post.title}\n  images={[]}\n  datePublished={post.createdAt}\n  dateModified={post.updatedAt}\n  authorName={[\n    {\n      name: 'Tsuizen',\n      url: 'https://blog.tsuizen.cn'\n    }\n  ]}\n  publisherName=\"Tsuizen\"\n  publisherLogo=\"https://blog.tsuizen.cn/images/logo.png\"\n  description={post.description}\n  isAccessibleForFree={true}\n/>\n```\n\n在网页中会被展开成如下形式:\n\n```html\n<script type=\"application/ld+json\">\n  {\n    \"@context\": \"https://schema.org\",\n    \"@type\": \"Article\",\n    \"datePublished\": \"2023-01-18T00:00:00.000Z\",\n    \"description\": \"身为码农怎么能没有自己的博客，由于博客园的整改风波，出于安全原因决定自己搭建，顺便可以练习技术以及督促自己更新🧐。\",\n    \"mainEntityOfPage\": {\n      \"@type\": \"WebPage\",\n      \"@id\": \"https://blog.tsuizen.cn/posts/使用Next.js构建我的个人博客\"\n    },\n    \"headline\": \"使用Next.js构建我的个人博客\",\n    \"image\": [],\n    \"dateModified\": \"2023-01-18T00:00:00.000Z\",\n    \"author\": [\n      { \"@type\": \"Person\", \"name\": \"Tsuizen\", \"url\": \"https://blog.tsuizen.cn\" }\n    ],\n    \"publisher\": {\n      \"@type\": \"Organization\",\n      \"name\": \"Tsuizen\",\n      \"logo\": {\n        \"@type\": \"ImageObject\",\n        \"url\": \"https://blog.tsuizen.cn/images/logo.png\"\n      }\n    },\n    \"isAccessibleForFree\": true\n  }\n</script>\n```\n\n这样谷歌就能根据你的需要展示更丰富的搜索结果。\n\n## 站点地图\n\n最后再来说说站点地图的问题，这是谷歌官方给出的定义：\n\n> 站点地图是一种文件，您可以在其中提供与您网站中的网页、视频或其他文件有关的信息，还可以说明这些内容之间的关系。Google 等搜索引擎会读取此文件，以便更高效地抓取您的网站。站点地图会告诉 Google 您认为网站中的哪些网页和文件比较重要，还会提供与这些文件有关的重要信息。例如，网页上次更新的时间和网页是否有任何备用的语言版本。\n\n我们可以使用`next-sitemap`来生成站点地图\n\n首先在根目录创建配置文件`next-sitemap.config.js`，添加地址，更新频率等需要的属性，然后根据需要可以在 `transform` 函数中配置不同相对路径中的属性\n，这里我修改了不同页面对应的优先级，更多的属性用法可以参考[官方文档](https://github.com/iamvishnusankar/next-sitemap)\n\n```javascript\n/** @type {import('next-sitemap').IConfig} */\n\nmodule.exports = {\n  siteUrl: 'https://blog.tsuizen.cn',\n  changefreq: 'daily',\n  priority: 1,\n  sitemapSize: 5000,\n  generateRobotsTxt: true,\n  // exclude: ['/protected-page', '/awesome/secret-page'],\n  // alternateRefs: [\n  //   {\n  //     href: 'https://blog.tsuizen.cn',\n  //     hreflang: 'cn'\n  //   }\n  // ],\n  // Default transformation function\n  transform: async (config, path) => {\n    const result = {\n      loc: 'https://blog.tsuizen.cn' + path, // => this will be exported as http(s)://<config.siteUrl>/<path>\n      changefreq: config.changefreq,\n      priority: config.priority,\n      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,\n      alternateRefs: config.alternateRefs ?? []\n    };\n    if (path.startsWith('/tag')) {\n      result.priority = 0.6;\n    }\n    if (path.startsWith('/posts')) {\n      result.priority = 1;\n      this.changefreq = 'always';\n    }\n    if (path.startsWith('/category')) {\n      result.priority = 0.4;\n    }\n    if (path.startsWith('/archives')) {\n      result.priority = 0.3;\n    }\n    return result;\n  },\n  // additionalPaths: async (config) => [\n  //   await config.transform(config, '/additional-page')\n  // ],\n  robotsTxtOptions: {\n    policies: [\n      {\n        userAgent: '*',\n        allow: '/'\n      },\n      {\n        userAgent: 'test-bot',\n        allow: ['/path', '/path-2']\n      }\n      // {\n      //   userAgent: 'black-listed-bot',\n      //   disallow: ['/sub-path-1', '/path-2']\n      // }\n    ],\n    additionalSitemaps: []\n  }\n};\n```\n\n最后在`package.json`中可以在 `postbuild` 周期配置执行脚本\n\n```json\n\"postbuild\": \"next-sitemap\",\n```\n\n然后我们就能看到 public 下生成了对应的站点 xml 文件和 robots.txt\n","slug":"add-seo-sitemap","tags":["Next.js","SEO"],"draft":false},{"excerpt":"","title":"还在使用传统图片懒加载？","content":"\n## 概述\n\n图片懒加载是每一个前端绕不过的话题，在用户访问页面时，如果一次性加载所有图片会极大地影响用户体验。图片懒加载就是让浏览器只请求出现在可视区域中的图片。\n传统图片懒加载方式有两种：\n\n- 监听 scroll 事件\n- IntersectionObserver API\n\n第一种方式通过监听 `scroll` 事件判断图片是否出现在可视区域中，然后替换 src 属性。虽然这种方式的兼容性较好，但是 `scroll`\n事件运行在主线程并且触发频繁，需要再写一个节流函数，非常不优雅。\n\n第二种方式使用 `IntersectionObserver` API 监听页面元素的可见性，是目前最为推荐的一种方式。`IntersectionObserver` 更方便使用并且具有更好的可读性，\n我们只需要考虑编写元素可见时需要执行的代码即可，主流浏览器也已经基本支持。\n![IntersectionObserver兼容性](/images/posts-images/image-lazy-loading/IntersectionObserver兼容性.jpg)\n\n## 浏览器级别的懒加载\n\n既然有了 `IntersectionObserver` 为什么还需要浏览器级别的懒加载支持，Chrome 团队给出的原因有两个：\n\n1. 不再需要引入外部工具或者库\n2. 浏览器禁止 JavaScript 也能正常工作\n\n但是第二点 MDN 给出不同的意见：\n\n:::warning\n备注： 仅在启用 JavaScript 时才会延迟加载。这是一种反跟踪的措施，因为，如果用户代理在禁用脚本的情况下支持延迟加载，网站仍然跨源通过在图像中策略性地放置图像来跟踪用户在整个会话期间的大致滚动位置，这样服务器可以跟踪请求了多少图像以及请求在何时发起。\n:::\n\n经过实际测试，在停用 javascript 时不会开启懒加载。\n\n### 使用方法\n\n使用方法非常简单，只需要在 img 标签中添加一个 loading 属性即可。\n\n```html\n<img src=\"image.png\" loading=\"lazy\" alt=\"…\" width=\"200\" height=\"200\" />\n```\n\nloading 的属性值有两个：\n\n- lazy: 图片懒加载\n- eager: 图片正常加载\n\n:::tip\n使用 eager 的图片相比不使用 loading 属性的 img 标签并不会获得更高的加载优先级，所以正常加载的图片无需添加此属性。\n:::\n\n### 效果\n\n#### Chrome\n\n为了让图片在进入视口时最大限度地加载完成，使用 lazy 属性的图片会在到达它附近的一个位置时就开始请求，chrome 中的请求过程如下：\n\n![chrome](/images/posts-images/image-lazy-loading/chrome.gif)\n\n可以看到在首次加载时请求了 5 张图片，下拉过程中到对应图片的距离到达一个阈值时就已经开始请求。\n\n页面在刷新时会记住刷新前的位置，浏览器也很智能地请求这个位置附近阈值范围内的图片：\n![chrome-diff-loc](/images/posts-images/image-lazy-loading/chrome-diff-loc.gif)\n\n另一个重要的特性是浏览器会根据网络条件改变阈值范围，网速越慢，阈值越高。在高速 3G 条件下，chrome 首次加载了 7 张图片：\n![chrome-3g](/images/posts-images/image-lazy-loading/chrome-3g.gif)\n\n> On fast connections (4G), we reduced Chrome's distance-from-viewport thresholds from 3000px to 1250px and on slower connections (3G or lower), changed the threshold from 4000px to 2500px. \n\n根据 chrome 开发者的说法，在 4G 条件下阈值大小为 1250px，而在 3G 或者更低时这个值为 2500px\n\n:::warning\n值的注意的是：\n\n1. 各个浏览器厂商对阈值大小有不同的实现并可能会在未来更改。在测试中 Safari 和 Firefox 的阈值都比 chrome 要小，而且没有考虑到不同的网络条件。\n2. 阈值大小是硬编码的，开发者目前不能自定义。\n   :::\n\n#### Firefox\n\n![firefox](/images/posts-images/image-lazy-loading/firefox.gif)\n\n#### Safari\n\n![safari](/images/posts-images/image-lazy-loading/safari.gif)\n\n### 兼容性\n\n本文测试平台:\n\nchrome 109.0.5414.119（正式版本） (arm64)\n\nfirefox 109.0(64 位)\n\nsafari 16.3 (18614.4.6.1.5)\n\n![兼容性](/images/posts-images/image-lazy-loading/兼容性.jpeg)\n\n## 参考资料\n\nhttps://web.dev/browser-level-image-lazy-loading/\n","slug":"image-lazy-loading","tags":["前端性能优化","HTML"],"draft":false}]