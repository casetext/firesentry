firesentry
==========

firesentry is a utility built on [firewatch](https://github.com/casetext/firewatch) that adds a HTTP API and hot code reloading.

This utility is intended to be run as a service pointed at a folder full of files inside that implement firebase watcher callbacks, inside a git repo.

API
---

- `GET /status` - returns 200 if firewatch is connected, 503 otherwise.
- `POST /update` - no parameters, requires HTTP Digest authentication with the password found in the `FIRESENTRY_TOKEN` environment variable.  Executes `git pull && npm install` on the watched folder.
  
  When that succeeds, it unloads the old version of the watcher code (by `delete`ing `require.cache`) and loads the new code in.

CLI
---

    firesentry db-name auth-token [scripts-folder]

    Options:
      -W, --no-web    Disable web server                                   [boolean]

      -p, --port      Web server port                               [default: 34737]

      -w, --watch     Watch scripts-folder for changes                     [boolean]

      -d, --debounce  File change debounce delay (ms)                 [default: 250]

      --help          Show help                                            [boolean]