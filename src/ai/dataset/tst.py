import pandas as pd

raw_dataset = pd.read_csv('./out.csv',
                      na_values = "?", comment='\t',
                      sep=" ", skipinitialspace=True)

dataset = raw_dataset.copy()
print(dataset.tail())
