import json
import feedparser
import os
from dateutil.parser import parse as parse_date
import time

def fetch_and_parse_feeds():
    # Get the absolute path of the script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    schools_file_path = os.path.join(script_dir, 'schools.json')
    posts_file_path = os.path.join(script_dir, 'posts.json')

    if not os.path.exists(schools_file_path):
        print(f"Error: {schools_file_path} not found.")
        return

    with open(schools_file_path, 'r', encoding='utf-8') as f:
        schools = json.load(f)

    all_posts = []
    for school in schools:
        print(f"Fetching feed for {school['name']}...")
        try:
            feed = feedparser.parse(school['feed_url'])
            for entry in feed.entries:
                # Convert time.struct_time to a standard string format
                published_time = time.strftime('%Y-%m-%dT%H:%M:%S%z', entry.published_parsed)
                post = {
                    'school_name': school['name'],
                    'title': entry.title,
                    'link': entry.link,
                    'published': published_time,
                }
                all_posts.append(post)
        except Exception as e:
            print(f"Could not fetch or parse feed for {school['name']}. Error: {e}")


    # Sort posts by published date, newest first
    all_posts.sort(key=lambda x: parse_date(x['published']), reverse=True)

    with open(posts_file_path, 'w', encoding='utf-8') as f:
        json.dump(all_posts, f, ensure_ascii=False, indent=2)

    print(f"Feeds fetched and {posts_file_path} updated.")

if __name__ == "__main__":
    fetch_and_parse_feeds()