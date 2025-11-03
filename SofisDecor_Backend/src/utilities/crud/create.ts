import { getFirestore } from 'firebase-admin/firestore';

/* external Utilities */
import isEqual from 'lodash/isEqual';

/* Local Utilities */
import {
    isArrayOfObjects,
    areArraysOfObjectsEquals,
} from "../verifiers/verifiers_fnc";

import {
    createCharacters,
    removePropFromObject,
} from "../mixed_actions.ts/mixedActions.";

/* Interfaces and Types */
import type { Firestore } from 'firebase-admin/firestore';
export interface KeyTest<U, S> {
    prop: S[] | null;
    objKey: string;
    left?: (keyof U)[];
    noVerify: boolean;
}

export const addDocFnc = async <T extends object, S = unknown>(
    structure: T,
    db: Firestore,
    collectionName: string,
    attr?: KeyTest<T, S>
): Promise<{ msg: string; isSaved: boolean }> => {

    try {

        const list = db.collection(collectionName);
        const docs = (await list.get()).docs;

        const getSameRecord = docs.filter((el) => {

            const dataRef = el.data() as T;

            const keys = Object.keys(dataRef)
            let controller: boolean[] = []

            keys.forEach(key => {

                const prop: keyof T = key as keyof T

                if (
                    Array.isArray(dataRef[prop]) &&
                    Array.isArray(attr?.prop) &&
                    attr.prop.length > 0
                ) {

                    if (attr!.left !== null && prop === attr?.left?.find(el => el === prop)) {

                        controller.push(false)

                    } else {

                        const array = dataRef[prop]

                        /* Check if it's array ofthe objects */
                        if (isArrayOfObjects(array)) {

                            if (Array.isArray(array)) {

                                const cleanTarget = array.map((el) => removePropFromObject<S>(el, attr!.objKey as keyof S));

                                const cleanProp = (attr?.prop as S[]).map((el) => removePropFromObject<S>(el, attr!.objKey as keyof S));

                                controller.push(areArraysOfObjectsEquals(cleanTarget, cleanProp));
                            }

                        } else {

                            if (attr?.left !== null && prop === attr?.left?.find(el => el === prop)) {

                                controller.push(false)

                            } else {

                                /* If it is an simple array */
                                const _struc: { [key: string]: any } = structure;
                                const struc = Object.keys(structure)
                                const strucKey = struc.find(el => el === prop)

                                if (areArraysOfObjectsEquals(dataRef[prop], _struc[strucKey!])) {

                                    controller.push(true);
                                }
                            }
                        }
                    }

                } else {

                    if (attr!.left !== null && prop === attr?.left?.find(el => el === prop)) {

                        controller.push(false)

                    } else {

                        /* If it's not array */
                        const _data = dataRef[prop]
                        const strucObj = structure[key as keyof T]

                        if (
                            typeof _data === 'object' && _data !== null && !Array.isArray(_data) &&
                            typeof strucObj === 'object' && strucObj !== null && !Array.isArray(strucObj)
                        ) {

                            const propRemoved_1 = removePropFromObject<S>(_data as S, attr!.objKey as keyof S);
                            const propRemoved_2 = removePropFromObject<S>(strucObj as S, attr!.objKey as keyof S);

                            if (isEqual(propRemoved_1, propRemoved_2)) {

                                controller.push(true);
                            }

                        } else {

                            if (!attr!.noVerify) {

                                controller.push(false);

                            } else {

                                const dynamicObj: Record<string, any> = {}
                                const fromData: Record<string, any> = {}

                                const propertties = Object.keys(removePropFromObject<T>(structure as T, attr!.objKey as keyof T))

                                propertties.forEach(prop => {

                                    const typeRef = structure[prop as keyof T]

                                    if (typeof typeRef !== 'object') {

                                        dynamicObj[prop] = structure[prop as keyof T]

                                        fromData[prop] = dataRef[prop as keyof T]

                                    }

                                })

                                if (isEqual(dynamicObj, fromData)) {

                                    controller.push(true);
                                }
                            }
                        }
                    }
                }

            });

            if (controller.some(el => el === true)) {

                return el
            }
        });

        if (getSameRecord.length > 0) {
            return {
                isSaved: false,
                msg: 'Já consta esse registro no banco de dados.',
            };
        }

        const ids = docs.map((item) => item.data().id);
        const uniqueIds = Array.from(new Set(ids));

        let newId = '';
        do {
            newId = createCharacters(10);
        } while (uniqueIds.includes(newId));

        const data = { ...structure, id: newId };
        await db.collection(collectionName).add(data);

        return {
            isSaved: true,
            msg: 'Salvo com sucesso.',
        };

    } catch (err) {

        throw new Error('Não foi possível executar essa operação: ' + err);
    }

};
