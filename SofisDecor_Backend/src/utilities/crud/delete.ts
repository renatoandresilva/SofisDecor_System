import type { Firestore, Query } from 'firebase-admin/firestore';

export const deleteDocFnc = async <T extends object>(
    db: Firestore,
    collectionName: string,
    options?: {
        docId?: string;
        filter?: {
            field: keyof T;
            operator: '==' | '>' | '>=' | '<' | '<=' | '!=' | 'in' | 'array-contains';
            value: any;
        }[];
        deleteAll?: boolean;
    }
): Promise<{ msg: string; deletedCount: number }> => {
    try {
        const collectionRef = db.collection(collectionName);

        // 🔍 Exclusão por ID
        if (options?.docId) {
            const docRef = collectionRef.doc(options.docId);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                return { msg: 'Documento não encontrado.', deletedCount: 0 };
            }

            await docRef.delete();
            return { msg: 'Documento excluído com sucesso.', deletedCount: 1 };
        }

        // 🔁 Paginação para exclusão em lote
        const batchSize = 500;
        let deletedCount = 0;
        let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | undefined = undefined;

        while (true) {
            let query: Query<FirebaseFirestore.DocumentData> = collectionRef;

            if (options?.filter && options.filter.length > 0) {
                options.filter.forEach(({ field, operator, value }) => {
                    query = query.where(field as string, operator, value);
                });
            }

            query = query.orderBy('__name__').limit(batchSize);
            if (lastDoc) {
                query = query.startAfter(lastDoc);
            }

            const snapshot = await query.get();
            if (snapshot.empty) break;

            const batch = db.batch();
            snapshot.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();

            deletedCount += snapshot.docs.length;
            if (snapshot.docs.length > 0) {
                lastDoc = snapshot.docs[snapshot.docs.length - 1];
            }

            // Se não estiver em modo deleteAll ou filtro, para após o primeiro lote
            if (!options?.deleteAll && !options?.filter) break;
        }

        if (deletedCount === 0) {
            return { msg: 'Nenhum documento encontrado para exclusão.', deletedCount: 0 };
        }

        return {
            msg: `Excluídos ${deletedCount} documento(s) com sucesso.`,
            deletedCount,
        };
    } catch (err) {
        throw new Error('Erro ao excluir: ' + err);
    }
};

/*
    COMO USAR 

    1. Excluir por ID:
    await deleteDocFnc(db, 'clientes', { docId: 'abc123' });

    2. Excluir por filtro (ex: ano ≥ 2020)
    await deleteDocFnc(db, 'pedidos', {
     filter: [{ field: 'ano', operator: '>=', value: 2020 }]
    });

    3. Excluir toda a coleção
    await deleteDocFnc(db, 'logs', { deleteAll: true });

*/