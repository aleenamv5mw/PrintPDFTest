# NSW-PRINT-PDF-PROD

Capability to fetch all print articles from a distribution and collate them to provide the end user with a single PDF file 

## Setup

1. Use the package manager [npm](https://github.com/npm) to install NSW-PRINT-PDF-PROD.

 ```bash
 npm install
 ```

2. Create a .env file and add env vars such as 
 - EMAIL
 - PASSWORD
 - PORT (for prod or staging in AWS)

example:
```bash
EMAIL="user@meltwater.com"
PASSWORD="your_account_password"
PORT=80
BUCKET='bucket_name'
REGION='region_name'
ACCESSKEYID='aws-access-key-id'
SECRETACCESSKEY='secret-access-key'
```
## Usage
run
 
```bash
node app.js
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.