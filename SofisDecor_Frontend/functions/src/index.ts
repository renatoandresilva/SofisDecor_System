import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const saleRecordUpdate = onSchedule(
  { schedule: '0 23 * * *', timeZone: 'America/Sao_Paulo' },
  async () => {

    // Datas de hoje e amanhã
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Verifica se o mês mudou
    const currMonth = today.getMonth();
    const nextMonth = tomorrow.getMonth();
    if (nextMonth === currMonth) return;

    // Verifica se já executou neste mês
    const controlRef = admin.firestore().collection('_control').doc('ultimaExecucao');
    const controlDoc = await controlRef.get();
    const ultimoMes = controlDoc.exists ? controlDoc.data()?.mes : null;
    if (ultimoMes === nextMonth) return;

    // Categorias que devem ser resetadas
    const categories = ["Fixo Indeterminado"];

    // Busca os documentos pagos dessas categorias
    const snapshot = await admin.firestore()
      .collection('_cost')
      .where('isPaid', '==', true)
      .where('category', 'in', categories)
      .get();

    // Atualiza todos para isPaid: false
    const batch = admin.firestore().batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, { isPaid: false });
    });
    await batch.commit();

    // Atualiza control de execução
    await controlRef.set({ mes: nextMonth });

    /* Envia notificação para os usuários
      await admin.messaging().send({
        notification: {
          title: "Novo mês iniciado!",
          body: "Os pagamentos fixos foram resetados. Verifique seus lançamentos.",
        },
        topic: "usuarios-ativos"
      });
    */
  }
);

/*
    export const updateGenericDoc = onSchedule(
    {
        schedule: '0 2 * * *', // todo dia às 02:00
        timeZone: 'America/Sao_Paulo',
    },
    async () => {
        const db = admin.firestore();
        const configsSnapshot = await db.collection('configs').get();

        for (const configDoc of configsSnapshot.docs) {
            const config = configDoc.data();

            if (
                !config.collection ||
                !config.filterField ||
                !config.filterOperator ||
                config.filterValue === undefined ||
                !config.updateFields
            ) {
                console.warn(`Configuração inválida em ${configDoc.id}`);
                continue;
            }

            const snapshot = await db
                .collection(config.collection)
                .where(config.filterField, config.filterOperator, config.filterValue)
                .get();

            const batch = db.batch();
            snapshot.forEach((doc) => {
                const updateData = { ...config.updateFields };

                // Substitui string "serverTimestamp" por valor real
                Object.keys(updateData).forEach((key) => {
                    if (updateData[key] === 'serverTimestamp') {
                        updateData[key] = admin.firestore.FieldValue.serverTimestamp();
                    }
                });

                batch.update(doc.ref, updateData);
            });

            await batch.commit();
            console.log(`Atualizados ${snapshot.size} documentos em ${config.collection}`);
        }
    }
    );
    Dados documento Configs
    {
        "collection": "usuarios",
        "filterField": "ativo",
        "filterOperator": "==",
        "filterValue": true,
        "updateFields": {
            "status": "verificado",
            "atualizadoEm": "serverTimestamp"
        }
    }

*/