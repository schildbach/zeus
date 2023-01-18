import * as React from 'react';
import {
    Image,
    NativeEventEmitter,
    NativeModules,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import BigNumber from 'bignumber.js';
import { LNURLWithdrawParams } from 'js-lnurl';
import { ButtonGroup, Header, Icon } from 'react-native-elements';
import { inject, observer } from 'mobx-react';
import _map from 'lodash/map';

import Success from '../assets/images/GIF/Success.gif';
import WordLogo from '../assets/images/SVG/Word Logo.svg';

import Amount from './../components/Amount';
import Button from './../components/Button';
import CollapsedQR from './../components/CollapsedQR';
import LoadingIndicator from './../components/LoadingIndicator';
import ModalBox from './../components/ModalBox';
import {
    SuccessMessage,
    WarningMessage,
    ErrorMessage
} from './../components/SuccessErrorMessage';
import Switch from './../components/Switch';
import TextInput from './../components/TextInput';

import FiatStore from './../stores/FiatStore';
import InvoicesStore from './../stores/InvoicesStore';
import SettingsStore from './../stores/SettingsStore';
import UnitsStore, { SATS_PER_BTC } from './../stores/UnitsStore';
import PosStore from './../stores/PosStore';

import { localeString } from './../utils/LocaleUtils';
import BackendUtils from './../utils/BackendUtils';
import { themeColor } from './../utils/ThemeUtils';

interface ReceiveProps {
    exitSetup: any;
    navigation: any;
    InvoicesStore: InvoicesStore;
    SettingsStore: SettingsStore;
    UnitsStore: UnitsStore;
    FiatStore: FiatStore;
    PosStore: PosStore;
}

interface ReceiveState {
    selectedIndex: number;
    addressType: string;
    memo: string;
    value: string;
    expiry: string;
    ampInvoice: boolean;
    routeHints: boolean;
    // POS
    orderId: string;
    orderAmount: number;
    orderTip: number;
}

@inject('InvoicesStore', 'SettingsStore', 'UnitsStore', 'FiatStore', 'PosStore')
@observer
export default class Receive extends React.Component<
    ReceiveProps,
    ReceiveState
> {
    listener: any;
    listenerSecondary: any;
    state = {
        selectedIndex: 0,
        addressType: '0',
        memo: '',
        value: '',
        expiry: '3600',
        ampInvoice: false,
        routeHints: false,
        // POS
        orderId: '',
        orderTip: 0,
        orderAmount: 0
    };

    componentDidMount() {
        const { navigation, InvoicesStore, SettingsStore } = this.props;
        const { reset } = InvoicesStore;
        const { settings, posStatus } = SettingsStore;
        const lnOnly =
            settings &&
            posStatus &&
            posStatus === 'active' &&
            settings.pos &&
            settings.pos.confirmationPreference &&
            settings.pos.confirmationPreference === 'lnOnly';

        reset();
        const lnurl: LNURLWithdrawParams | undefined =
            navigation.getParam('lnurlParams');

        const amount: string = navigation.getParam('amount');
        const autoGenerate: boolean = navigation.getParam('autoGenerate');

        // POS
        const memo: string = navigation.getParam('memo');
        const orderId: string = navigation.getParam('orderId');
        const orderAmount: number = navigation.getParam('orderAmount');
        const orderTip: number = navigation.getParam('orderTip');

        if (orderId) {
            this.setState({
                orderId,
                orderAmount,
                orderTip
            });
        }

        if (lnurl) {
            this.setState({
                memo: lnurl.defaultDescription,
                value: (lnurl.maxWithdrawable / 1000).toString()
            });
        }

        if (amount) {
            this.setState({
                value: amount
            });
        }

<<<<<<< HEAD
=======
        if (lnOnly) {
            this.setState({
                selectedIndex: 1
            });
        }

>>>>>>> 59886a969b3bac7eaa5bbbd65e1cc7621934ffa7
        if (autoGenerate)
            this.autoGenerateInvoice(this.getSatAmount(amount), memo);
    }

    componentWillUnmount() {
        if (this.listener && this.listener.stop) this.listener.stop();
    }

<<<<<<< HEAD
    autoGenerateInvoice = (amount?: string, memo?: string) => {
=======
    autoGenerateInvoice = async (amount?: string, memo?: string) => {
>>>>>>> 59886a969b3bac7eaa5bbbd65e1cc7621934ffa7
        const { InvoicesStore } = this.props;
        const { createUnifiedInvoice } = InvoicesStore;
        const { expiry, ampInvoice, routeHints, addressType } = this.state;

<<<<<<< HEAD
        createUnifiedInvoice(
=======
        const { rHash, onChainAddress } = await createUnifiedInvoice(
>>>>>>> 59886a969b3bac7eaa5bbbd65e1cc7621934ffa7
            memo || '',
            amount || '0',
            expiry,
            undefined,
            ampInvoice,
            routeHints,
            BackendUtils.supportsAddressTypeSelection() ? addressType : null
        );

        this.subscribeInvoice(rHash, onChainAddress || '');
    };

<<<<<<< HEAD
    subscribeInvoice = (rHash: string) => {
        const { InvoicesStore, PosStore, SettingsStore } = this.props;
        const { orderId, orderAmount, orderTip } = this.state;
        const { implementation } = SettingsStore;
=======
    subscribeInvoice = (rHash: string, onChainAddress: string) => {
        const { InvoicesStore, PosStore, SettingsStore } = this.props;
        const { orderId, orderAmount, orderTip, value } = this.state;
        const { implementation, settings } = SettingsStore;
>>>>>>> 59886a969b3bac7eaa5bbbd65e1cc7621934ffa7
        const { setWatchedInvoicePaid } = InvoicesStore;

        const numConfPreference =
            settings.pos && settings.pos.confirmationPreference === '1conf'
                ? 1
                : 0;

        if (implementation === 'lightning-node-connect') {
            const { LncModule } = NativeModules;
            const eventName = BackendUtils.subscribeInvoice(rHash);
            const eventEmitter = new NativeEventEmitter(LncModule);
            this.listener = eventEmitter.addListener(
                eventName,
                (event: any) => {
                    if (event.result) {
                        try {
                            const result = JSON.parse(event.result);
                            if (result.settled) {
                                setWatchedInvoicePaid(result.amt_paid_sat);
                                if (orderId)
                                    PosStore.makePayment({
                                        orderId,
                                        orderAmount,
                                        orderTip
                                    });
                                this.listener = null;
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }
                }
            );

            const eventName2 = BackendUtils.subscribeTransactions();
            const eventEmitter2 = new NativeEventEmitter(LncModule);
            this.listenerSecondary = eventEmitter2.addListener(
                eventName2,
                (event: any) => {
                    if (event.result) {
                        try {
                            const result = JSON.parse(event.result);
                            if (
                                result.dest_addresses.includes(
                                    onChainAddress
                                ) &&
                                result.num_confirmations >= numConfPreference &&
                                result.amount >= Number(value)
                            ) {
                                setWatchedInvoicePaid(result.amount);
                                if (orderId)
                                    PosStore.makePayment({
                                        orderId,
                                        orderAmount,
                                        orderTip
                                    });
                                this.listenerSecondary = null;
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }
                }
            );
        }

        if (implementation === 'lnd') {
            BackendUtils.subscribeInvoice(rHash).then((response: any) => {
<<<<<<< HEAD
                if (response.result && response.result.settled) {
                    setWatchedInvoicePaid(response.result.amt_paid_sat);
=======
                const result = response.result;
                if (result && result.settled) {
                    setWatchedInvoicePaid(result.amt_paid_sat);
>>>>>>> 59886a969b3bac7eaa5bbbd65e1cc7621934ffa7
                    if (orderId)
                        PosStore.makePayment({
                            orderId,
                            orderAmount,
                            orderTip
                        });
<<<<<<< HEAD
=======
                }
            });

            BackendUtils.subscribeTransactions().then((response: any) => {
                const result = response.result;
                if (
                    result.dest_addresses.includes(onChainAddress) &&
                    result.num_confirmations >= numConfPreference &&
                    result.amount >= Number(value)
                ) {
                    setWatchedInvoicePaid(result.amount);
                    if (orderId)
                        PosStore.makePayment({
                            orderId,
                            orderAmount,
                            orderTip
                        });
                    this.listener = null;
>>>>>>> 59886a969b3bac7eaa5bbbd65e1cc7621934ffa7
                }
            });
        }
    };

    getNewAddress = (params: any) => {
        const { InvoicesStore } = this.props;
        InvoicesStore.getNewAddress(params);
    };

    updateIndex = (selectedIndex: number) => {
        this.setState({
            selectedIndex
        });
    };

    getSatAmount = (amount?: string) => {
        const { FiatStore, SettingsStore, UnitsStore } = this.props;
        const { fiatRates } = FiatStore;
        const { settings } = SettingsStore;
        const { fiat } = settings;
        const { units } = UnitsStore;

        const value = amount || this.state.value;

        const fiatEntry =
            fiat && fiatRates && fiatRates.filter
                ? fiatRates.filter((entry: any) => entry.code === fiat)[0]
                : null;

        const rate =
            fiat && fiat !== 'Disabled' && fiatRates && fiatEntry
                ? fiatEntry.rate
                : 0;

        let satAmount: string | number;
        switch (units) {
            case 'sats':
                satAmount = value;
                break;
            case 'BTC':
                satAmount = Number(value) * SATS_PER_BTC;
                break;
            case 'fiat':
                satAmount = Number(
                    (Number(value.replace(/,/g, '.')) / Number(rate)) *
                        Number(SATS_PER_BTC)
                ).toFixed(0);
                break;
        }

        return satAmount;
    };

    render() {
        const {
            InvoicesStore,
            SettingsStore,
            UnitsStore,
            FiatStore,
            navigation
        } = this.props;
        const {
            selectedIndex,
            addressType,
            memo,
            value,
            expiry,
            ampInvoice,
            routeHints
        } = this.state;
        const { units, changeUnits, getAmount } = UnitsStore;
        const { getSymbol }: any = FiatStore;

        const {
            createUnifiedInvoice,
            onChainAddress,
            payment_request,
            payment_request_amt,
            creatingInvoice,
            creatingInvoiceError,
            error_msg,
            watchedInvoicePaid,
            watchedInvoicePaidAmt,
            clearUnified,
            reset
        } = InvoicesStore;
<<<<<<< HEAD
        const { implementation, posStatus } = SettingsStore;
=======
        const { implementation, posStatus, settings } = SettingsStore;
>>>>>>> 59886a969b3bac7eaa5bbbd65e1cc7621934ffa7
        const loading = SettingsStore.loading || InvoicesStore.loading;
        const address = onChainAddress;

        const lnOnly =
            settings &&
            posStatus &&
            posStatus === 'active' &&
            settings.pos &&
            settings.pos.confirmationPreference &&
            settings.pos.confirmationPreference === 'lnOnly';

        const satAmount = this.getSatAmount();

        const lnurl: LNURLWithdrawParams | undefined =
            navigation.getParam('lnurlParams');

        const BackButton = () => (
            <Icon
                name="arrow-back"
                onPress={() => {
                    reset();
                    navigation.navigate('Wallet');
                }}
                color={themeColor('text')}
                underlayColor="transparent"
            />
        );

        const ClearButton = () => (
            <Icon
                name="cancel"
                onPress={() => InvoicesStore.clearUnified()}
                color={themeColor('text')}
                underlayColor="transparent"
            />
        );

        const SettingsButton = () => (
            <Icon
                name="settings"
                onPress={() => this.refs.modal.open()}
                color={themeColor('text')}
                underlayColor="transparent"
            />
        );

        const ADDRESS_TYPES = BackendUtils.supportsTaproot()
            ? [
                  {
                      key: localeString('views.Receive.np2wkhKey'),
                      value: '1',
                      description: localeString(
                          'views.Receive.np2wkhDescription'
                      )
                  },
                  {
                      key: localeString('views.Receive.p2wkhKey'),
                      value: '0',
                      description: localeString(
                          'views.Receive.p2wkhDescription'
                      )
                  },
                  {
                      key: localeString('views.Receive.p2trKey'),
                      value: '4',
                      description: localeString('views.Receive.p2trDescription')
                  }
              ]
            : [
                  {
                      key: localeString('views.Receive.np2wkhKey'),
                      value: '1',
                      description: localeString(
                          'views.Receive.np2wkhDescriptionAlt'
                      )
                  },
                  {
                      key: localeString('views.Receive.p2wkhKey'),
                      value: '0',
                      description: localeString(
                          'views.Receive.p2wkhDescription'
                      )
                  }
              ];

        const unifiedButton = () => (
            <React.Fragment>
                <Text
                    style={{
                        color:
                            selectedIndex === 0
                                ? themeColor('background')
                                : themeColor('text'),
                        fontFamily: 'Lato-Regular'
                    }}
                >
                    {localeString('general.unified')}
                </Text>
            </React.Fragment>
        );

        const lightningButton = () => (
            <React.Fragment>
                <Text
                    style={{
                        color:
                            selectedIndex === 1
                                ? themeColor('background')
                                : themeColor('text'),
                        fontFamily: 'Lato-Regular'
                    }}
                >
                    {localeString('general.lightning')}
                </Text>
            </React.Fragment>
        );

        const onChainButton = () => (
            <React.Fragment>
                <Text
                    style={{
                        color:
                            selectedIndex === 2
                                ? themeColor('background')
                                : themeColor('text'),
                        fontFamily: 'Lato-Regular'
                    }}
                >
                    {localeString('general.onchain')}
                </Text>
            </React.Fragment>
        );

        const buttons = [
            { element: unifiedButton },
            { element: lightningButton },
            { element: onChainButton }
        ];

        const haveUnifiedInvoice = !!payment_request && !!address;
        const haveInvoice = !!payment_request || !!address;

        let unifiedInvoice, lnInvoice, btcAddress;
        if (haveUnifiedInvoice) {
            unifiedInvoice = `bitcoin:${address.toUpperCase()}?${`lightning=${payment_request.toUpperCase()}`}${
                Number(satAmount) > 0
                    ? `&amount=${new BigNumber(satAmount)
                          .dividedBy(SATS_PER_BTC)
                          .toFormat()}`
                    : ''
            }${memo ? `&message=${memo.replace(/ /g, '%20')}` : ''}`;
        }

        if (payment_request) {
            lnInvoice = `lightning:${payment_request.toUpperCase()}`;
        }

        if (address) {
            btcAddress = `bitcoin:${address.toUpperCase()}${
                (Number(satAmount) > 0 || memo) && '?'
            }${
                Number(satAmount) > 0
                    ? `amount=${new BigNumber(satAmount)
                          .dividedBy(SATS_PER_BTC)
                          .toFormat()}`
                    : ''
            }${
                memo
                    ? Number(satAmount) > 0
                        ? `&message=${memo.replace(/ /g, '%20')}`
                        : `message=${memo.replace(/ /g, '%20')}`
                    : ''
            }`;
        }

        const belowDustLimit: boolean =
            Number(satAmount) !== 0 && Number(satAmount) < 546;

        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: themeColor('background')
                }}
            >
                <Header
                    leftComponent={<BackButton />}
                    centerComponent={{
                        text: localeString('views.Receive.title'),
                        style: {
                            color: themeColor('text'),
                            fontFamily: 'Lato-Regular'
                        }
                    }}
                    rightComponent={
                        loading ||
                        watchedInvoicePaid ||
                        posStatus === 'active' ? null : haveInvoice ? (
                            <ClearButton />
                        ) : (
                            BackendUtils.supportsAddressTypeSelection() && (
                                <SettingsButton />
                            )
                        )
                    }
                    backgroundColor={themeColor('background')}
                    containerStyle={{
                        borderBottomWidth: 0
                    }}
                />

                <ScrollView style={styles.content}>
                    {creatingInvoiceError && (
                        <ErrorMessage
                            message={localeString('views.Receive.errorCreate')}
                        />
                    )}
                    {error_msg && <ErrorMessage message={error_msg} />}

                    {watchedInvoicePaid ? (
                        <View
                            style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingTop: 100
                            }}
                        >
                            <WordLogo
                                height={150}
                                style={{
                                    alignSelf: 'center'
                                }}
                            />
                            <Image
                                source={Success}
                                style={{ width: 290, height: 290 }}
                            />
                            <Text
                                style={{
                                    ...styles.text,
                                    fontSize: 20,
                                    top: -50,
                                    alignSelf: 'center',
                                    color: themeColor('text')
                                }}
                            >
                                {posStatus === 'active'
                                    ? localeString('views.Wallet.Invoices.paid')
                                    : `${localeString(
                                          'views.Receive.youReceived'
                                      )} ${getAmount(
                                          watchedInvoicePaidAmt ||
                                              payment_request_amt
                                      )}`}
                            </Text>
                            <Button
                                title={
                                    posStatus === 'active'
                                        ? localeString('general.goBack')
                                        : localeString(
                                              'views.SendingLightning.goToWallet'
                                          )
                                }
                                icon={{
                                    name: 'list',
                                    size: 25
                                }}
                                onPress={() =>
                                    navigation.navigate('Wallet', {
                                        refresh: true
                                    })
                                }
                                containerStyle={{ width: '100%' }}
                            />
                        </View>
                    ) : (
                        <View>
                            {!!payment_request && (
                                <>
                                    {implementation === 'lndhub' &&
                                        !!address &&
                                        !belowDustLimit && (
                                            <WarningMessage
                                                message={localeString(
                                                    'views.Receive.warningLndHub'
                                                )}
                                            />
                                        )}
                                    {!!lnurl && (
                                        <SuccessMessage
                                            message={
                                                !!lnurl &&
                                                `${localeString(
                                                    'views.Receive.successCreate'
                                                )} ${localeString(
                                                    'views.Receive.andSentTo'
                                                )} ${lnurl.domain}`
                                            }
                                        />
                                    )}
                                </>
                            )}
                            {creatingInvoice && <LoadingIndicator />}
                            {haveInvoice && !creatingInvoiceError && (
                                <View style={{ marginTop: 10 }}>
                                    {selectedIndex == 0 &&
                                        !belowDustLimit &&
                                        haveUnifiedInvoice && (
                                            <CollapsedQR
                                                value={unifiedInvoice}
                                                copyText={localeString(
                                                    'views.Receive.copyInvoice'
                                                )}
                                                expanded
                                                textBottom
                                            />
                                        )}
                                    {selectedIndex == 1 &&
                                        !belowDustLimit &&
                                        haveUnifiedInvoice && (
                                            <CollapsedQR
                                                value={lnInvoice}
                                                copyText={localeString(
                                                    'views.Receive.copyInvoice'
                                                )}
                                                expanded
                                                textBottom
                                            />
                                        )}
                                    {selectedIndex == 2 &&
                                        !belowDustLimit &&
                                        haveUnifiedInvoice && (
                                            <CollapsedQR
                                                value={btcAddress}
                                                copyText={localeString(
                                                    'views.Receive.copyAddress'
                                                )}
                                                expanded
                                                textBottom
                                            />
                                        )}
                                    {(belowDustLimit ||
                                        !haveUnifiedInvoice) && (
                                        <CollapsedQR
                                            value={lnInvoice}
                                            copyText={localeString(
                                                'views.Receive.copyAddress'
                                            )}
                                            expanded
                                            textBottom
                                        />
                                    )}
                                    {!belowDustLimit &&
                                        haveUnifiedInvoice &&
                                        !lnOnly && (
                                            <ButtonGroup
                                                onPress={this.updateIndex}
                                                selectedIndex={selectedIndex}
                                                buttons={buttons}
                                                selectedButtonStyle={{
                                                    backgroundColor:
                                                        themeColor('highlight'),
                                                    borderRadius: 12
                                                }}
                                                containerStyle={{
                                                    backgroundColor:
                                                        themeColor('secondary'),
                                                    borderRadius: 12,
                                                    borderColor:
                                                        themeColor('secondary')
                                                }}
                                                innerBorderStyle={{
                                                    color: themeColor(
                                                        'secondary'
                                                    )
                                                }}
                                            />
                                        )}
                                </View>
                            )}
                            {!loading && !haveInvoice && (
                                <>
                                    <Text
                                        style={{
                                            ...styles.secondaryText,
                                            color: themeColor('secondaryText')
                                        }}
                                    >
                                        {localeString('views.Receive.memo')}
                                    </Text>
                                    <TextInput
                                        placeholder={localeString(
                                            'views.Receive.memoPlaceholder'
                                        )}
                                        value={memo}
                                        onChangeText={(text: string) => {
                                            this.setState({ memo: text });
                                            clearUnified();
                                        }}
                                    />

                                    <TouchableOpacity
                                        onPress={() => changeUnits()}
                                    >
                                        <Text
                                            style={{
                                                ...styles.secondaryText,
                                                color: themeColor(
                                                    'secondaryText'
                                                )
                                            }}
                                        >
                                            {localeString(
                                                'views.Receive.amount'
                                            )}
                                            {lnurl &&
                                            lnurl.minWithdrawable !==
                                                lnurl.maxWithdrawable
                                                ? ` (${Math.ceil(
                                                      lnurl.minWithdrawable /
                                                          1000
                                                  )}--${Math.floor(
                                                      lnurl.maxWithdrawable /
                                                          1000
                                                  )})`
                                                : ''}
                                        </Text>
                                    </TouchableOpacity>
                                    <TextInput
                                        keyboardType="numeric"
                                        placeholder={'0'}
                                        value={value}
                                        onChangeText={(text: string) => {
                                            this.setState({ value: text });
                                        }}
                                        locked={
                                            lnurl &&
                                            lnurl.minWithdrawable ===
                                                lnurl.maxWithdrawable
                                                ? true
                                                : false
                                        }
                                        prefix={
                                            units !== 'sats' &&
                                            (units === 'BTC'
                                                ? '₿'
                                                : !getSymbol().rtl
                                                ? getSymbol().symbol
                                                : null)
                                        }
                                        suffix={
                                            units === 'sats'
                                                ? units
                                                : getSymbol().rtl &&
                                                  units === 'fiat' &&
                                                  getSymbol().symbol
                                        }
                                        toggleUnits={changeUnits}
                                    />
                                    {units !== 'sats' && (
                                        <Amount
                                            sats={satAmount}
                                            fixedUnits="sats"
                                            toggleable
                                        />
                                    )}
                                    {units !== 'BTC' && (
                                        <Amount
                                            sats={satAmount}
                                            fixedUnits="BTC"
                                            toggleable
                                        />
                                    )}
                                    {units === 'fiat' && (
                                        <TouchableOpacity
                                            onPress={() => changeUnits()}
                                        >
                                            <Text
                                                style={{
                                                    ...styles.text,
                                                    color: themeColor('text')
                                                }}
                                            >
                                                {FiatStore.getRate()}
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {implementation !== 'lndhub' && (
                                        <>
                                            <Text
                                                style={{
                                                    ...styles.secondaryText,
                                                    color: themeColor(
                                                        'secondaryText'
                                                    ),
                                                    paddingTop: 10
                                                }}
                                            >
                                                {localeString(
                                                    'views.Receive.expiration'
                                                )}
                                            </Text>
                                            <TextInput
                                                keyboardType="numeric"
                                                placeholder={'3600 (one hour)'}
                                                value={expiry}
                                                onChangeText={(text: string) =>
                                                    this.setState({
                                                        expiry: text
                                                    })
                                                }
                                            />
                                        </>
                                    )}

                                    {BackendUtils.isLNDBased() && (
                                        <>
                                            <Text
                                                style={{
                                                    ...styles.secondaryText,
                                                    color: themeColor(
                                                        'secondaryText'
                                                    ),
                                                    top: 20
                                                }}
                                            >
                                                {localeString(
                                                    'views.Receive.routeHints'
                                                )}
                                            </Text>
                                            <Switch
                                                value={routeHints}
                                                onValueChange={() =>
                                                    this.setState({
                                                        routeHints: !routeHints
                                                    })
                                                }
                                            />
                                        </>
                                    )}

                                    {BackendUtils.supportsAMP() && (
                                        <>
                                            <Text
                                                style={{
                                                    ...styles.secondaryText,
                                                    color: themeColor(
                                                        'secondaryText'
                                                    ),
                                                    top: 20
                                                }}
                                            >
                                                {localeString(
                                                    'views.Receive.ampInvoice'
                                                )}
                                            </Text>
                                            <Switch
                                                value={ampInvoice}
                                                onValueChange={() =>
                                                    this.setState({
                                                        ampInvoice: !ampInvoice
                                                    })
                                                }
                                            />
                                        </>
                                    )}

                                    <View style={styles.button}>
                                        <Button
                                            title={
                                                localeString(
                                                    'views.Receive.createInvoice'
                                                ) +
                                                (lnurl
                                                    ? ` ${localeString(
                                                          'views.Receive.andSubmitTo'
                                                      )} ${lnurl.domain}`
                                                    : '')
                                            }
                                            onPress={() => {
                                                createUnifiedInvoice(
                                                    memo,
                                                    satAmount.toString() || '0',
                                                    expiry,
                                                    lnurl,
                                                    ampInvoice,
                                                    routeHints,
                                                    BackendUtils.supportsAddressTypeSelection()
                                                        ? addressType
                                                        : undefined
                                                ).then(
                                                    ({
                                                        rHash,
                                                        onChainAddress
                                                    }: any) => {
                                                        this.subscribeInvoice(
                                                            rHash,
                                                            onChainAddress || ''
                                                        );
                                                    }
                                                );
                                            }}
                                        />
                                    </View>
                                </>
                            )}
                        </View>
                    )}
                </ScrollView>
                <ModalBox
                    style={{
                        backgroundColor: themeColor('background'),
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        height: BackendUtils.supportsTaproot() ? 450 : 350,
                        paddingLeft: 24,
                        paddingRight: 24
                    }}
                    swipeToClose={true}
                    backButtonClose={true}
                    position="bottom"
                    ref="modal"
                >
                    <Text
                        style={{
                            color: themeColor('text'),
                            fontSize: 24,
                            fontWeight: 'bold',
                            paddingTop: 24,
                            paddingBottom: 24
                        }}
                    >
                        {localeString('views.Receive.addressType')}
                    </Text>
                    {_map(ADDRESS_TYPES, (d, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                InvoicesStore.clearAddress();
                                this.setState({ addressType: d.value });
                                this.refs.modal.close();
                            }}
                            style={{
                                backgroundColor: themeColor('secondary'),
                                borderColor:
                                    d.value === addressType
                                        ? themeColor('highlight')
                                        : themeColor('secondaryText'),
                                borderRadius: 4,
                                borderWidth: d.value === addressType ? 2 : 1,
                                padding: 16,
                                marginBottom: 24
                            }}
                        >
                            <Text
                                style={{
                                    color: themeColor('text'),
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                    marginBottom: 4
                                }}
                            >
                                {d.key}
                            </Text>
                            <Text
                                style={{
                                    color: themeColor('text'),
                                    fontSize: 16,
                                    fontWeight: 'regular'
                                }}
                            >
                                {d.description}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ModalBox>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    content: {
        paddingLeft: 20,
        paddingRight: 20
    },
    button: {
        paddingTop: 25,
        paddingBottom: 15
    },
    text: {
        fontFamily: 'Lato-Regular'
    },
    secondaryText: {
        fontFamily: 'Lato-Regular'
    }
});
