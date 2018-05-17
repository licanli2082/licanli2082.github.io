#!/bin/bash
for i in newsroom_0*.html; do   tidy -q -utf8 -numeric -asxhtml --show-warnings no  --force-output y $i 2>/dev/null  | sed -e 's/ xmlns.*=".*"//g' -e '/DOCTYPE/d' -e '/transitional/d' | xmlstarlet sel  -t -m '//ul[@class="newsList"]/li' -c .; done  | tr -d '\n' | sed -e 's^<li\>^\n&^g' | sort -V | awk NF > newslist.li
