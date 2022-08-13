echo `yarn -v`;

yarn build;

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
    echo -e "\e[31mPush to remote repository failed, retry in 1 second...\e[0m"
    sleep 2
  fi
done

echo -e "\e[32m$msg\e[0m";
