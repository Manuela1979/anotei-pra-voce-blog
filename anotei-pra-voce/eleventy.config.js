const { DateTime } = require("luxon");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const slugify = require("slugify");

module.exports = function(eleventyConfig) {

  // Plugins
  eleventyConfig.addPlugin(pluginSyntaxHighlight);

  // Copy `assets/` to `_site/assets`
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");


  // Date Filters
  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).setLocale('pt-BR').toLocaleString(DateTime.DATE_FULL);
  });

  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
  });

  // Slugify Filter
  eleventyConfig.addFilter("slugify", function(str) {
    return slugify(str, {
      lower: true,
      replacement: "-",
      remove: /[*+~.()/'"!:@]/g
    });
  });

  // Collections: Posts
  eleventyConfig.addCollection("post", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/**/*.md");
  });

  // Collections: Categories
  eleventyConfig.addCollection("categories", function(collectionApi) {
    let categories = new Set();
    collectionApi.getFilteredByGlob("posts/**/*.md").forEach(item => {
      if (item.data.category) {
        categories.add(item.data.category);
      }
    });
    return [...categories].sort();
  });

  // Create a collection for each category
  eleventyConfig.addCollection("postsByCategory", function(collectionApi) {
    let postsByCategory = {};
    collectionApi.getFilteredByGlob("posts/**/*.md").forEach(item => {
      if (item.data.category) {
        const categorySlug = slugify(item.data.category, { lower: true, replacement: "-", remove: /[*+~.()/'"!:@]/g });
        if (!postsByCategory[item.data.category]) {
          postsByCategory[item.data.category] = [];
        }
        postsByCategory[item.data.category].push(item);
      }
    });
    // Add collections dynamically
    Object.keys(postsByCategory).forEach(category => {
        eleventyConfig.addCollection(category, () => postsByCategory[category]);
    });
    return postsByCategory; // Return the structure if needed elsewhere
  });


  // Filter for category pages
  eleventyConfig.addFilter("filterByCategory", function(posts, category) {
    return posts.filter(post => post.data.category === category);
  });

  // Shortcode for current year
  eleventyConfig.addShortcode("currentYear", () => `${new Date().getFullYear()}`);

  // Return your Object options:
  return {
    dir: {
      input: ".",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
