# nckl -- cheap & easy crypto DCA
https://nckl.app/

Dollar-cost averaging into crypto assets currently has too many trade-offs:
* Coinbase app charges high fees, up to **10%**
* Exchange terminals (e.g. Coinbase Pro, FTX, Kraken) don't offer DCA
* Other options sacrifice custody, list few coins, or are not as trusted as the platforms above

_This project offers a middle-ground by giving users a simple DCA experience on top of the low-fee Coinbase Pro APIs, all secured by the user's Coinbase login._

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
