I have a dataset on international patent cooperation as a weighted edge list.

**Here is the structure:**

```
glimpse(df)
Rows: 137,990
Columns: 6
$ year_application <dbl> 2013, 2011, 2017, 2018, 2011, 2010, 2016, 2012…
$ owner1           <chr> "QA3470001011260", "AT1341110434146", "SG00084…
$ country_1        <chr> "QA", "AT", "SG", "SA", "DK", "DE", "SK", "FI"…
$ owner2           <chr> "IN6180001080984", "MC5012401013038", "JP14821…
$ country_2        <chr> "IN", "MC", "JP", "LI", "BY", "GR", "CN", "EG"…
$ weight           <dbl> 5, 4, 4, 5, 2, 3, 2, 3, 3, 2, 8, 2, 4, 3, 3, 5…
```

**Here are 15 sample rows:**

```
> head(df, 15)

    year_application          owner1 country_1          owner2 country_2
               <num>          <char>    <char>          <char>    <char>
 1:             2013 QA3470001011260        QA IN6180001080984        IN
 2:             2011 AT1341110434146        AT MC5012401013038        MC
 3:             2017     SG000849327        SG    JP148214588L        JP
 4:             2018    SA132902414L        SA       LIKR75683        LI
 5:             2011    DK6070518285        DK    BY164180403L        BY
 6:             2010    DE169362426L        DE      GR91004103        GR
 7:             2016    SK*863000131        SK CN2001110378525        CN
 8:             2012    FI8330385155        FI      EG91902435        EG
 9:             2016     NOB73805731        NO      ZA28950255        ZA
10:             2012    CZ126368579L        CZ EG1101113676660        EG
11:             2010      LT17108431        LT KY8250005001432        KY
12:             2012 TH1101113479494        TH    HK277888337L        HK
13:             2013 MD5011201005245        MD FR6010905002126        FR
14:             2013     NZ384449773        NZ    FR135642846L        FR
15:             2016    SE3190220743        SE CW1101114952093        CW

    weight
     <num>
 1:      5
 2:      4
 3:      4
 4:      5
 5:      2
 6:      3
 7:      2
 8:      3
 9:      3
10:      2
11:      8
12:      2
13:      4
14:      3
15:      3
```

~138.000 rows, ~60 countries, time range 2000–2018.

Research question: How do international patent cooperation patterns evolve over time, and which countries occupy central positions in the cooperation network?

Write R code using tidyverse and ggplot2 for an exploratory analysis.
