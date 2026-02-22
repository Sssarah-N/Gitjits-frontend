FORCE:

prod: tests github

tests: FORCE
	CI=true npm test

github: FORCE
	-git commit -a -m "Auto commit"
	git push origin main
