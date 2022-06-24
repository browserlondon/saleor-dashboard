import {
  Dialog,
  DialogActions,
  DialogContent,
  InputAdornment,
  TextField
} from "@material-ui/core";
import VerticalSpacer from "@saleor/apps/components/VerticalSpacer";
import { CountryFragment } from "@saleor/graphql";
import { ChangeEvent } from "@saleor/hooks/useForm";
import { useLocalSearch } from "@saleor/hooks/useLocalSearch";
import { buttonMessages } from "@saleor/intl";
import { Button, DialogHeader, SearchIcon } from "@saleor/macaw-ui";
import { taxesMessages } from "@saleor/taxes/messages";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { useStyles } from "./styles";
import { TaxCountryDialogLine } from "./TaxCountryDialogLine";

interface TaxCountryDialogProps {
  open: boolean;
  countries: CountryFragment[];
  onConfirm: (countries: CountryFragment[]) => void;
  onClose: () => void;
}

export interface CountryFragmentWithState extends CountryFragment {
  checked: boolean;
}

export const TaxCountryDialog: React.FC<TaxCountryDialogProps> = ({
  open,
  countries,
  onConfirm,
  onClose
}) => {
  const classes = useStyles();
  const intl = useIntl();

  const [countriesWithState, setCountriesWithState] = React.useState<
    CountryFragmentWithState[]
  >([]);
  React.useEffect(
    () =>
      setCountriesWithState(
        countries.map(country => ({ checked: false, ...country }))
      ),
    [countries]
  );
  const handleChange = React.useCallback(
    (e: ChangeEvent) => {
      const countriesUpdate = [...countriesWithState];
      countriesUpdate.find(country => country.code === e.target.name).checked =
        e.target.value;
      setCountriesWithState(countriesUpdate);
    },
    [countries, setCountriesWithState]
  );

  const handleClose = () => {
    onClose();
    setCountriesWithState([]);
    setQuery("");
  };

  const { query, setQuery, searchResult: filteredCountries } = useLocalSearch<
    CountryFragmentWithState
  >(countriesWithState, country => country.country);

  return (
    <Dialog open={open} fullWidth onClose={handleClose}>
      <DialogHeader onClose={handleClose}>
        <FormattedMessage {...taxesMessages.chooseCountries} />
      </DialogHeader>
      <DialogContent className={classes.wrapper}>
        <TextField
          value={query}
          onChange={e => setQuery(e.target.value)}
          variant="outlined"
          placeholder={intl.formatMessage(taxesMessages.country)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          inputProps={{ className: classes.inputPadding }}
        />
        <VerticalSpacer spacing={2} />
        <div className={classes.scrollable}>
          {filteredCountries.map(country => (
            <TaxCountryDialogLine
              key={"modal" + country.code}
              country={country}
              checked={country.checked}
              handleChange={handleChange}
            />
          ))}
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          variant="primary"
          onClick={() => {
            onConfirm(countriesWithState.filter(country => country.checked));
            handleClose();
          }}
        >
          <FormattedMessage {...buttonMessages.select} />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaxCountryDialog;