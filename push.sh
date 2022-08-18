type yarn > /dev/null 2>&1;
if [ $? -eq 0 ]
then
  yarn build
else
  npm run build
fi

# SEO
robots="`pwd`/docs/robots.txt"
if [ ! -f $robots ]
then
  echo "创建robots.txt"
  cat > $robots << EOF
User-agent: *
Allow: /
EOF
fi

git add .;

msg="Site Update `date "+%Y-%m-%d %H:%M:%S"`";

git commit -m "$msg";

while true
do
  git push origin --set-upstream master;
  if [ $? -eq 0 ]
  then
    echo -e "\e[32mPush to remote repository success\e[0m"
    break
  else
    echo -e "\e[31mPush to remote repository failed, retry in 3 second...\e[0m"
    sleep 3
  fi
done

echo -e "\e[32m$msg\e[0m";
