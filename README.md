# Open Source 20 Questions Implementation

This is an open source 20 questions game implementation (you might know the game from akinator.com) in Django Rest Framework and Angular. 

This is mostly a personal project, so some good-practice dev behaviors that you might be used to are probably not followed (because reasons), but I do my best to keep things decent. If you are interested in maintaining this to a higher standard, please drop me an email: **ionescu.vlad1 @ gmail POINT com**. For questions or code improvement suggestions, please open an issue or submit a pull request.

Below is a description of how to get this running on a bare-bones server, such as a Google Cloud or Amazon Virtual Machine. Some of it is written from memory, so if something doesn't work quite right, feel free to open an issue.

1. Make sure your server has a dual core (v)CPU and at least 4 GB RAM. I tried with 2 GB RAM and it might work, but my Angular builds failed due to low memory quite often. 20 GB Disk space should be enough. Make sure ports `80` and `443` are open.
2. Install Postgres and configure it - lots of info on Google. I recommend making a "twentyq" user that you will use, write down its password. Manually create a database called `open_20q_api`.
3. Install `git` and `git clone` this repository - I recommend you do it in your home folder.
4. Install Python's anaconda and create the environment: cd to the `open-twenty-q` folder and do `conda env create -f environment.yml`. Then activate the conda environment with `conda activate django-open-20q` - if you log out and back in you will need to activate it again.
5. Install `nginx` - lots of info on Google.
6. Optionally, use something like certbot / Acme cert manager and a domain + DNS provider to generate a free SSL certificate.
7. I use something like the following nginx config file at `/etc/nginx/conf.d/twentyq.conf` on CentOS 7 - make sure you use your own username:

    ```
    server {
        listen 0.0.0.0:443 ssl;
        listen [::]:443 ssl;
        server_name twentyq.evobyte.org;
        root /var/www/open-twenty-q;
        location / {
            try_files $uri $uri/ /index.html;
        }
        location /api {
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_pass http://unix:/home/ionescu_vlad1/twentyq.sock;
        }
        ssl_certificate /home/ionescu_vlad1/.acme.sh/twentyq.evobyte.org/fullchain.cer;
        ssl_certificate_key /home/ionescu_vlad1/.acme.sh/twentyq.evobyte.org/twentyq.evobyte.org.key;
    }
    server {
        listen 0.0.0.0:80;
        listen [::]:80;
        server_name twentyq.evobyte.org;
        # Permanent redirect to HTTPS version with www prefix
        return 301 https://twentyq.evobyte.org$request_uri;
    }
    ```
8. If you don't use SSL, just delete the second server block, remove the `ssl` parts and replace `443` with `80`.
9. Go in the `django` folder and create your `.env` file. Here is an example - don't worry, these aren't my real passwords:
    ```
    SECRET_KEY = 'some long string'
    DB_ENGINE = 'django.db.backends.postgresql'
    DB_NAME = 'open_20q_api'
    DB_USER = 'twentyq'
    DB_PASSWORD = 'qwertyuiopa123'
    DB_HOST = 'localhost'
    DB_PORT = 5432
    DEBUG = True <--- set it to False for a real deployment
    
    distance_from_leader_cutoff = 2
    clear_leader_cutoff = 2
    exploration_questions_after_clear_leader = 5
    max_total_questions = 20
    max_question_autocomplete_results = 20
    min_common_words_for_question_autocomplete = 4
    random_entities_for_new_question = 20
    latest_games_for_stats = 10    
    ```
10. Go in the `django` folder and run `python manage.py migrate` to run the migrations.
11. Start the Django REST API with gunicorn, follow this tutorial: https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-centos-7 - you don't need to install anything because we already installed things when creating our conda environment.
12. You might want to add rate limiting too, see this tutorial: https://medium.com/@christopherphillips_88739/rate-limiting-in-nginx-5af7511ab3ce - my deployment does this. My deployment also handles CORS according to: https://enable-cors.org/server_nginx.html
13. Compile the Angular app: install `npm`, `angular` (only tested with version 11) and do `npm install` and `ng build --prod` in the `open-twenty-q` folder.
14. Copy everything to the root nginx web folder you specified in step `7`. I use `rsync` for that, from the `open-twenty-q` folder: `sudo rsync -a --delete dist/open-twenty-q/ /var/www/open-twenty-q/`.
15. You can do `ng build --prod` and step `12` whenever you `git pull` changes to the Angular app. Do `sudo systemctl restart gunicorn` when pulling changes to the Django app.
16. You might need to edit `ALLOWED_HOSTS` in Django's `settings.py` and add your own hostname.
17. That's it, you can now visit your domain name / server IP in the browser and it should display. Make sure you also followed the permission setting instructions in the linked tutorials.
18. Currently you will need to seed the database with `1` entity and `1` question, otherwise the API won't behave properly. Other than the UUIDs and date times, you can add whatever you want. Here are some UUIDs and date times you can copy paste: `25bccbb0-adce-4ca0-96f5-668adb5faa25`, `3d42b4f8-e273-49b8-8412-b9130a42e3c2`, `2021-12-30 22:50:04.825663+00`.
19. Any problems please open an issue.

