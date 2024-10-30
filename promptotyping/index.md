---
layout: default
title: Promptotyping Documentation
---

{% include_relative README.md %}

## Example Promptotypes

{% assign promptotype_folders = site.pages | where_exp: "item", "item.path contains 'promptotyping/' and item.name == 'README.md' and item.path != 'promptotyping/README.md'" %}
{% for page in promptotype_folders %}
{% assign folder_name = page.path | split: '/' | reverse | first %}
### [{{ folder_name | capitalize }}]({{ site.baseurl }}/{{ page.path | remove: 'README.md' }})
{{ page.content | markdownify }}
---
{% endfor %}
