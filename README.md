# nckl -- cheap & easy crypto DCA
https://nckl.app/

Dollar-cost averaging into crypto assets currently has too many trade-offs:
* Coinbase app charges high fees, up to **10%**
* Exchange terminals (e.g. Coinbase Pro, FTX, Kraken) don't offer DCA
* Other options sacrifice custody, list few coins, or are not as trusted as the platforms above

_This project offers a middle-ground by giving users a simple DCA experience on top of the low-fee Coinbase Pro APIs, all secured by the user's Coinbase login._

## Dev setup
This repo is optimized to work with the Visual Studio Code [Remote Containers](https://code.visualstudio.com/docs/remote/containers) environment. The following should get you up and running:
1. GCloud setup
    1. Ask your favorite admin to add you to GCP project ;)
    2. [Install `gcloud` CLI](https://cloud.google.com/sdk/docs/install-sdk#installing_the_latest_version)
    3. [`gcloud init`](https://cloud.google.com/sdk/docs/install-sdk#initializing_the)
    4. Confirm that `~/.config/gcloud` exists -- this is where we should find your credentials, which will be mounted into the dev environment
2. Get Docker, VSCode and the Remote Containers environment up: https://code.visualstudio.com/docs/remote/containers#_installation
3. Spin up dev environment
    1. Clone repo
    2. Open repo root in VSCode (e.g. `code .` from root dir)
    3. Build dev container and reopen project inside container: In VSCode, type `Shift+Cmd+P` to pull up command pallete and execute `Remote-Containers: Reopen in container`
4. Add local config in `.vscode/local.env` -- take a look at `.vscode/local.env.example` for guidance!

### Run app
The easiest way to run the application locally with a configured dev setup is to run the custom `Run App` task. Simply bring up your VSCode command pallete (`Shift+Cmd+P`) and execute `Tasks: Run Task` > `Run App`. This might take a few minutes the first time as Docker images are built for all the services. In the end, we should have containers running for all services, as well as a Webpack Dev Server serving a dev build of the React app.

## MVP flows
**First-time setup**
1. Land on https://nckl.app as a new user
2. Login with your user account for first time, bootstrapping account
3. Walk through creation of Coinbase Pro portfolio & API key
4. Submit API key
5. Configure DCA allocations
6. Fund portfolio

**Update allocations**
1. Login
2. Add/remove/update an asset allocation

**Low funds notification**
1. User USD funds fall below some level
2. Service emits an email notification alerting them that they are low on funds
3. Add funds to portfolio

**Savings calculator**
1. (In landing page)
2. Plug in hypothetical DCA allocation
3. View how much $$$ you'd save using service over vanilla Coinbase consumer app
