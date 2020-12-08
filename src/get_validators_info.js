const polkadotAPI = require('@polkadot/api')
const ApiPromise = polkadotAPI.ApiPromise;
const WsProvider = polkadotAPI.WsProvider;

const wsProvider = new WsProvider('wss://rpc.polkadot.io');

async function getValidatorBalances(api, validators) {
    const balances = [];

    for (const address of (validators.toHuman())) {
        const balance = (await api.query.system.account(address)).data;
        balances.push(balance);
    }

    return balances;
}

async function getValidatorCommissionValues(api, validators) {
    const commissions = [];

    for (const address of (validators.toHuman())) {
        const commission = (await api.query.staking.validators(address)).commission.toHuman();
        commissions.push(commission)
    }

    return commissions;
}

async function getValidatorLedgers(api, validators) {
    const ledgers = [];

    for (const address of (validators.toHuman())) {
        const ledger = await api.query.staking.ledger(address);
        ledgers.push(ledger);
    }

    return ledgers;
}

async function getValidatorsInfo() {
    const api = await ApiPromise.create({provider: wsProvider});

    // Получаем и выводим chain, имя и версию ноды
    const chain = await api.rpc.system.chain();
    const nodeName = await api.rpc.system.name();
    const nodeVersion = await api.rpc.system.version();

    console.log();
    console.log(`Chain: ${chain.toHuman()}`);
    console.log(`Node name: ${nodeName.toHuman()}`);
    console.log(`Node version: ${nodeVersion.toHuman()}`);
    console.log();

    // Выполняем запрос к ноде, с которой установлено соединение, на получение валидаторов
    const validators = await api.query.session.validators();

    // Если валидаторы были получены, выведем их адреса и некоторую информацию о них
    if (validators && validators.length > 0) {
        console.log(`Found ${validators.length} validators:\n`)

        // Получить баланс каждого валидатора
        const validatorBalances = await getValidatorBalances(api, validators);

        // Получить значение коммиссии каждого валидатора
        const validatorCommissions = await getValidatorCommissionValues(api, validators);

        // Получить предпочтения каждого валидатора
        const validatorLedger = await getValidatorLedgers(api, validators);

        validators.forEach((authorityId, index) => {
            console.log(`Validator: ${authorityId.toString()}`);
            console.log(`Free balance: ${validatorBalances[index].free.toHuman()}`);
            console.log(`Reserved: ${validatorBalances[index].reserved.toHuman()}`);
            console.log(`Misc frozen: ${validatorBalances[index].miscFrozen.toHuman()}`);
            console.log(`Fee frozen: ${validatorBalances[index].feeFrozen.toHuman()}`);
            console.log(`Commission: ${validatorCommissions[index]}`);
            console.log(`Ledger: ${validatorLedger[index]}`);
            console.log();
        });
    }
}

getValidatorsInfo()
    .then(() => console.log("Success"))
    .catch((err) => console.log(err));
