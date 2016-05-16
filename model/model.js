type Asset struct {
	CUSIP	    string 	   `json:"cusip"`	//Committee on Uniform Securities Identification Procedures - identifies most financial instruments
	Name		string 	   `json:"name"`
    AdrStreet   string     `json:"adrStreet"`
    AdrCity     string     `json:"adrCity"`
    AdrPostcode string     `json:"adrPostcode"`
    AdrState    string     `json:"adrState"`
    Qty         int        `json:"quantity"`
    MktValue    float64    `json:"mktval"`
    BuyValue    float64    `json:"buyval"`
    Owners      []Owner    `json:"owner"`
    PT4Sale     []ForSale  `json:"forsale"`
    Issuer      string     `json:"issuer"`
    IssueDate   string     `json:"issueDate"`
    
    mktvalPerToken //extended
}

type Owner struct {
    InvestorID  string   `json:"invid"`    //user name
    Quantity    int      `json:"quantity"`
    
    mktval	//per owner: extended
}

type ForSale struct {
    InvestorID  string   `json:"invid"`    //user name
    Quantity    int      `json:"quantity"`
    
    mktval	//for sale: extended
}

//User account
type Account struct {
    ID          string   `json:"id"`            //user name
    Prefix      string   `json:"prefix"`
    CashBalance float64  `json:"cashBalance"`
    AssetsIds   []string `json:"assetIds"`
}


type UpdateMktVal struct {
	CUSIP       string   `json:"cusip"`
	MktValue    float64  `json:"mktval"`
}

type ForSale struct {
    InvestorID string   `json:"invid"`
    Quantity   int      `json:"quantity"`
    SellVal    float64  `json:"sellval"`  //value per token
}

type Transaction struct {
	CUSIP       string   `json:"cusip"`
	FromCompany string   `json:"fromCompany"`
	ToCompany   string   `json:"toCompany"`
	Quantity    int      `json:"quantity"`
}

type AddForSale struct {
    CUSIP       string   `json:"cusip"`
    FromCompany string   `json:"fromCompany"`
    Quantity    int      `json:"quantity"`
    SellVal     float64  `json:"sellval"`
}