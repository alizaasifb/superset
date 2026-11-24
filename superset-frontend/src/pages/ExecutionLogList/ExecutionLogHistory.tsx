/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { t } from '@apache-superset/core/translation';
import { css, styled } from '@apache-superset/core/theme';
import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loading } from '@superset-ui/core/components';
import SubMenu from 'src/features/home/SubMenu';
import withToasts from 'src/components/MessageToasts/withToasts';
import AlertResultHistoryChart, {
  HistoryPoint,
} from 'src/features/alerts/components/AlertResultHistoryChart';
import {
  useListViewResource,
  useSingleViewResource,
} from 'src/views/CRUD/hooks';
import { AlertObject, LogObject } from 'src/features/alerts/types';

const NUM_RUNS = 100;
const EXECUTED_STATES = ['Success', 'Not triggered'];

const StyledHeader = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;

    a,
    Link {
      margin-left: ${theme.sizeUnit * 4}px;
      font-size: ${theme.fontSizeSM};
      font-weight: ${theme.fontWeightNormal};
      text-decoration: underline;
    }
  `}
`;

const StyledContent = styled.div`
  ${({ theme }) => css`
    padding: ${theme.sizeUnit * 4}px;
  `}
`;

interface ExecutionLogHistoryProps {
  addDangerToast: (msg: string) => void;
}

function ExecutionLogHistory({ addDangerToast }: ExecutionLogHistoryProps) {
  const { alertId }: any = useParams();

  const {
    state: { loading, resourceCollection: logs },
    fetchData,
  } = useListViewResource<LogObject>(
    `report/${alertId}/log`,
    t('log'),
    addDangerToast,
    false,
  );

  const {
    state: { loading: alertLoading, resource: alertResource },
    fetchResource,
  } = useSingleViewResource<AlertObject>(
    'report',
    t('reports'),
    addDangerToast,
  );

  useEffect(() => {
    if (alertId !== null && !alertLoading) {
      fetchResource(alertId);
    }
  }, [alertId]);

  useEffect(() => {
    fetchData({
      pageIndex: 0,
      pageSize: NUM_RUNS,
      sortBy: [{ id: 'start_dttm', desc: true }],
      filters: [{ id: 'state', operator: 'in', value: EXECUTED_STATES }],
    });
  }, [alertId]);

  const points = useMemo<HistoryPoint[]>(
    () =>
      logs
        .filter(({ value }) => value !== null && value !== '')
        .map(
          ({ start_dttm: startDttm, value }) =>
            [new Date(startDttm).getTime(), Number(value)] as HistoryPoint,
        )
        .filter(([time, value]) => !Number.isNaN(time) && !Number.isNaN(value))
        .sort((a, b) => a[0] - b[0]),
    [logs],
  );

  const path = `/alert/${alertId}/log/`;
  const ALERT_TEXT = t('Alert');

  let content;
  if (loading) {
    content = <Loading />;
  } else if (points.length === 0) {
    content = (
      <p>
        {t(
          'No past runs with a numeric value yet. The chart appears once the alert has run a few times.',
        )}
      </p>
    );
  } else {
    content = <AlertResultHistoryChart points={points} />;
  }

  return (
    <>
      <SubMenu
        name={
          <StyledHeader>
            <span>
              {alertResource ? `${ALERT_TEXT}:` : null} {alertResource?.name}
            </span>
            <span>
              <Link to={path}>{t('Back to execution log')}</Link>
            </span>
          </StyledHeader>
        }
      />
      <StyledContent>{content}</StyledContent>
    </>
  );
}

export default withToasts(ExecutionLogHistory);