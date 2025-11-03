import type { Firestore, Query } from 'firebase-admin/firestore';
import isEqual from 'lodash/isEqual';

export const updateDocFnc = async <T extends object>(
    db: Firestore,
    collectionName: string,
    newData: Partial<T>,
    options: {
        docId?: string;
        filter?: Partial<T>;
        onlyIfChanged?: boolean;
    }
): Promise<{ msg: string; isUpdated: boolean }> => {
    try {
        let docRef;

        // 🔍 Buscar por ID ou filtro
        if (options.docId) {
            docRef = db.collection(collectionName).doc(options.docId);
        } else if (options.filter) {
            let filtered: Query<FirebaseFirestore.DocumentData> = db.collection(collectionName);

            Object.entries(options.filter).forEach(([key, value]) => {
                filtered = filtered.where(key, '==', value);
            });

            const snapshot = await filtered.limit(1).get();
            if (snapshot.empty) {
                return {
                    isUpdated: false,
                    msg: 'Nenhum documento encontrado com esse filtro.',
                };
            }

            docRef = snapshot.docs[0]?.ref;
        } else {
            return {
                isUpdated: false,
                msg: 'É necessário fornecer um docId ou um filtro.',
            };
        }

        const docSnap = await docRef?.get();
        if (!docSnap?.exists) {
            return {
                isUpdated: false,
                msg: 'Documento não encontrado.',
            };
        }

        // 🔄 Verificar se os dados mudaram
        if (options.onlyIfChanged) {
            const currentData = docSnap.data() as T;
            const merged = { ...currentData, ...newData };

            if (isEqual(currentData, merged)) {
                return {
                    isUpdated: false,
                    msg: 'Nenhuma alteração detectada.',
                };
            }
        }

        await docRef?.update(newData);

        return {
            isUpdated: true,
            msg: 'Atualizado com sucesso.',
        };
    } catch (err) {
        throw new Error('Erro ao atualizar: ' + err);
    }
};

/*
    COMO USAR A FUNÇÃO

    1. Somente quando houver mudança:
    await updateDocFnc(db, 'clientes', { nome: 'Renato' }, {
        docId: 'abc123',
        onlyIfChanged: true
    });

    2. Por filtro:
    await updateDocFnc(db, 'clientes', { ativo: false }, { filter: { email: 'renato@email.com' }}); 

*/