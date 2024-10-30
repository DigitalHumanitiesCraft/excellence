---
layout: default
title: Promptotyping Documentation
---

{% include_relative README.md %}

## Example Promptotypes

{% for item in site.pages %}
  {% if item.path contains 'promptotyping/' and item.path contains 'README.md' and item.path != 'promptotyping/README.md' %}
    {% include_relative {{ item.path }} %}
  {% endif %}
{% endfor %}
