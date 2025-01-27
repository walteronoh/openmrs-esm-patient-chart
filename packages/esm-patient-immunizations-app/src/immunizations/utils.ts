import map from 'lodash-es/map';
import find from 'lodash-es/find';
import { ExistingDoses, Immunization } from '../types';
import { ImmunizationSequenceDefinition, OpenmrsConcept, ImmunizationData } from './immunization-domain';

export const findConfiguredSequences = (configuredSequences: Array<ImmunizationSequenceDefinition>) => {
  return (immunizationsConceptSet: OpenmrsConcept): Array<ImmunizationData> => {
    const immunizationConcepts: Array<OpenmrsConcept> = immunizationsConceptSet?.setMembers;
    return map(immunizationConcepts, (immunizationConcept) => {
      const immunizationDataFromConfig: ImmunizationData = {
        vaccineName: immunizationConcept.display,
        vaccineUuid: immunizationConcept.uuid,
        existingDoses: [],
      };

      const matchingSequenceDef = find(
        configuredSequences,
        (sequencesDef) => sequencesDef.vaccineConceptUuid === immunizationConcept.uuid,
      );
      immunizationDataFromConfig.sequences = matchingSequenceDef?.sequences;
      return immunizationDataFromConfig;
    });
  };
};

export const findExistingDoses = (
  configuredImmunizations: Array<Immunization>,
  existingImmunizationsForPatient: Array<Immunization>,
): Array<Immunization> => {
  return map(configuredImmunizations, (immunizationFromConfig) => {
    const matchingExistingImmunization = find(
      existingImmunizationsForPatient,
      (existingImmunization) => existingImmunization.vaccineUuid === immunizationFromConfig.vaccineUuid,
    );
    if (matchingExistingImmunization) {
      immunizationFromConfig.existingDoses = matchingExistingImmunization.existingDoses;
    }
    return immunizationFromConfig;
  });
};

export const latestFirst = (a: ExistingDoses, b: ExistingDoses) =>
  new Date(b.occurrenceDateTime).getTime() - new Date(a.occurrenceDateTime).getTime();
